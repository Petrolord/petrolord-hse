import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, subDays } from 'date-fns';

export const analyticsService = {
  // Aggregate data and store in analytics_insights
  generateDailyInsights: async (orgId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Get reports for today
      const { data: reports, error: reportError } = await supabase
        .from('quick_reports')
        .select('*')
        .eq('organization_id', orgId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (reportError) throw reportError;

      if (!reports || reports.length === 0) return null;

      // 2. Calculate metrics
      const totalReports = reports.length;
      const criticalReports = reports.filter(r => r.severity === 'critical' || r.severity === 'high').length;
      
      // Calculate resolution time (mock logic if closed_at is missing for most)
      const closedReports = reports.filter(r => r.status === 'closed' && r.closed_at);
      let avgResolutionTime = 0;
      if (closedReports.length > 0) {
        const totalDuration = closedReports.reduce((acc, r) => {
          const start = new Date(r.created_at);
          const end = new Date(r.closed_at);
          return acc + (end - start);
        }, 0);
        avgResolutionTime = (totalDuration / closedReports.length) / (1000 * 60 * 60); // Hours
      }

      // Find top severity
      const severityCounts = reports.reduce((acc, r) => {
        acc[r.severity || 'low'] = (acc[r.severity || 'low'] || 0) + 1;
        return acc;
      }, {});
      const topSeverity = Object.keys(severityCounts).sort((a, b) => severityCounts[b] - severityCounts[a])[0];

      // Find top location
      const locationCounts = reports.reduce((acc, r) => {
        const loc = r.location || 'Unknown';
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {});
      const topLocation = Object.keys(locationCounts).sort((a, b) => locationCounts[b] - locationCounts[a])[0];

      // Find top category
      const categoryCounts = reports.reduce((acc, r) => {
        const cat = r.category || 'General';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

      // 3. Store in DB
      const { data: insight, error: insertError } = await supabase
        .from('analytics_insights')
        .upsert({
          organization_id: orgId,
          date: today,
          total_reports_submitted: totalReports,
          critical_reports_count: criticalReports,
          average_resolution_time: parseFloat(avgResolutionTime.toFixed(2)),
          top_severity_type: topSeverity,
          top_location: topLocation,
          top_issue_category: topCategory,
          timestamp: new Date().toISOString() // Helper timestamp
        }, { onConflict: 'organization_id, date' })
        .select()
        .single();

      if (insertError) throw insertError;
      return insight;

    } catch (error) {
      console.error('Error generating daily insights:', error);
      return null;
    }
  },

  // Get aggregated insights for a period
  getInsights: async (orgId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('organization_id', orgId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching insights:', error);
      return { data: [], error };
    }
  },

  // Get raw reports for detailed charting if insights are missing
  getRawReportData: async (orgId) => {
    try {
      const { data, error } = await supabase
        .from('quick_reports')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching raw report data:', error);
      return { data: [], error };
    }
  },

  // Predict future trends (Mock AI implementation using heuristics)
  getPredictiveInsights: async (orgId) => {
    // In a real app, this would call an Edge Function with an ML model
    // Here we use simple heuristics based on recent data
    try {
      const lastWeek = subDays(new Date(), 7).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      const { data: recentReports } = await analyticsService.getInsights(orgId, lastWeek, today);
      
      if (!recentReports || recentReports.length < 3) {
        return {
          riskLevel: 'Low',
          predictedIncidentsNextWeek: 2,
          highRiskLocation: 'Analysis pending...',
          recommendedAction: 'Continue baseline monitoring.'
        };
      }

      // Simple trend analysis
      const trend = recentReports.map(r => r.total_reports_submitted);
      const increasing = trend[trend.length - 1] > trend[0];
      
      return {
        riskLevel: increasing ? 'Medium' : 'Low',
        predictedIncidentsNextWeek: Math.round(trend.reduce((a,b)=>a+b,0) / trend.length * 1.2),
        highRiskLocation: recentReports[recentReports.length - 1]?.top_location || 'General Site',
        recommendedAction: increasing 
          ? 'Increase supervision in high-activity zones.' 
          : 'Maintain current safety protocols.'
      };

    } catch (error) {
      return {
        riskLevel: 'Unknown',
        predictedIncidentsNextWeek: 0,
        highRiskLocation: 'N/A',
        recommendedAction: 'Unable to generate prediction.'
      };
    }
  }
};