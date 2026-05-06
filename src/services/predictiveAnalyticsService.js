import { supabase } from '@/lib/customSupabaseClient';

/**
 * Petrolord AI Safety Predictor - Phase 1: Data Aggregation & Foundation
 * This service aggregates data from Incidents, Actions, Audits, and Environment
 * to create a normalized dataset for future AI modeling.
 */
export const predictiveAnalyticsService = {
  
  /**
   * Aggregates all safety data for a specific organization
   * Acts as the "Data Foundation" for the AI model
   */
  async getAggregatedSafetyData(orgId) {
    if (!orgId) return null;

    // Parallel fetch for performance
    const [incidents, actions, audits, envData, hazards] = await Promise.all([
      this.fetchIncidents(orgId),
      this.fetchActions(orgId),
      this.fetchAudits(orgId),
      this.fetchEnvironmentalData(orgId),
      this.fetchHazards(orgId)
    ]);

    return {
      metrics: this.calculateKPIMetrics(incidents, actions, audits, hazards),
      trends: this.calculateTrends(incidents),
      risk_factors: this.identifyRiskFactors(incidents, actions, audits, hazards),
      raw_data: { incidents, actions, audits, envData, hazards } // For ML Training
    };
  },

  // --- Data Fetchers ---

  async fetchIncidents(orgId) {
    const { data } = await supabase
      .from('incidents')
      .select('id, report_type, severity, incident_date, status, site_id, hazard_category')
      .eq('organization_id', orgId)
      .order('incident_date', { ascending: false });
    return data || [];
  },

  async fetchActions(orgId) {
    const { data } = await supabase
      .from('actions')
      .select('id, status, priority, due_date, updated_at, effectiveness_score')
      .eq('organization_id', orgId);
    return data || [];
  },

  async fetchAudits(orgId) {
    try {
      const { data } = await supabase
        .from('safety_audits')
        .select('compliance_score, audit_date')
        .eq('organization_id', orgId)
        .order('audit_date', { ascending: false })
        .limit(10);
      return data || [];
    } catch (e) { return []; } 
  },

  async fetchEnvironmentalData(orgId) {
    try {
      const { data } = await supabase
        .from('environmental_monitoring')
        .select('*')
        .eq('organization_id', orgId)
        .order('reading_time', { ascending: false })
        .limit(50);
      return data || [];
    } catch (e) { return []; }
  },

  async fetchHazards(orgId) {
    try {
      const { data } = await supabase
        .from('hazard_assessments')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'active');
      return data || [];
    } catch (e) { return []; }
  },

  // --- Normalization & Calculation Engines ---

  calculateKPIMetrics(incidents, actions, audits, hazards) {
    const totalIncidents = incidents.filter(i => ['Incident', 'Accident'].includes(i.report_type)).length;
    const totalNearMisses = incidents.filter(i => i.report_type === 'Near Miss').length;
    
    // Near-miss to Incident Ratio (Leading Indicator)
    const ratio = totalIncidents > 0 ? (totalNearMisses / totalIncidents).toFixed(1) : totalNearMisses;

    // Corrective Action Closure Rate
    const closedActions = actions.filter(a => a.status === 'closed' || a.status === 'completed').length;
    const closureRate = actions.length > 0 ? Math.round((closedActions / actions.length) * 100) : 0;

    // Average Compliance
    const avgCompliance = audits.length > 0 
      ? Math.round(audits.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / audits.length) 
      : 0;

    return {
      incident_count: totalIncidents,
      near_miss_count: totalNearMisses,
      nm_incident_ratio: ratio,
      action_closure_rate: closureRate,
      avg_compliance_score: avgCompliance,
      active_hazards: hazards.length
    };
  },

  calculateTrends(incidents) {
    // Group by month for last 6 months
    const trends = {};
    const months = 6;
    
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trends[key] = { incidents: 0, nearmisses: 0 };
    }

    incidents.forEach(inc => {
      if (!inc.incident_date) return;
      const date = new Date(inc.incident_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (trends[key]) {
        if (['Incident', 'Accident'].includes(inc.report_type)) {
          trends[key].incidents++;
        } else if (inc.report_type === 'Near Miss') {
          trends[key].nearmisses++;
        }
      }
    });

    return Object.entries(trends)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  identifyRiskFactors(incidents, actions, audits, hazards) {
    const riskFactors = [];

    // 1. High Incident Severity Detection
    const criticalIncidents = incidents.filter(i => ['Critical', 'High'].includes(i.severity)).length;
    if (criticalIncidents > 0) {
      riskFactors.push({
        type: 'critical_severity',
        severity: 'High',
        message: `${criticalIncidents} critical/high severity incidents recorded recently.`
      });
    }

    // 2. Action Lag Detection
    const overdueActions = actions.filter(a => {
      return (a.status !== 'closed' && a.status !== 'completed') && new Date(a.due_date) < new Date();
    }).length;
    
    if (overdueActions > 5) {
      riskFactors.push({
        type: 'action_lag',
        severity: 'Medium',
        message: `${overdueActions} corrective actions are overdue.`
      });
    }

    // 3. Compliance Dip
    if (audits.length >= 2) {
      const latest = audits[0].compliance_score;
      const previous = audits[1].compliance_score;
      if (latest < previous) {
        riskFactors.push({
          type: 'compliance_dip',
          severity: 'Medium',
          message: 'Safety compliance score has dropped since last audit.'
        });
      }
    }

    // 4. High Risk Hazards
    const highRiskHazards = hazards.filter(h => h.likelihood === 'High' && h.impact === 'Severe').length;
    if (highRiskHazards > 0) {
      riskFactors.push({
        type: 'high_risk_hazard',
        severity: 'High',
        message: `${highRiskHazards} identified hazards have High Likelihood & Severe Impact.`
      });
    }

    return riskFactors;
  }
};