import { supabase } from '@/lib/customSupabaseClient';

export const dataQualityService = {
  async getMetrics(organizationId) {
    const { data } = await supabase
      .from('data_quality_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('checked_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) return data[0];

    // Mock data
    return {
      overall_score: 82,
      completeness_score: 88,
      consistency_score: 76,
      freshness_score: 95,
      issues_found: [
        { type: 'Missing Data', severity: 'Medium', description: '5% of Incident records missing "Shift" field', count: 12 },
        { type: 'Format Error', severity: 'Low', description: 'Inconsistent date formats in legacy inspection logs', count: 45 },
        { type: 'Outlier', severity: 'High', description: 'Unusual spike in temperature readings from Sensor X-99', count: 3 }
      ],
      checked_at: new Date().toISOString()
    };
  }
};