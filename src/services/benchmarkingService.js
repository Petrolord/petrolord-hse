import { supabase } from '@/lib/customSupabaseClient';

export const benchmarkingService = {
  async getBenchmarks(organizationId) {
    const { data } = await supabase
      .from('benchmarking_data')
      .select('*')
      .eq('organization_id', organizationId);

    if (data && data.length > 0) return data;

    // Mock data
    return [
      { metric_name: 'Risk Score', org_value: 45, industry_avg: 58, top_quartile: 32, category: 'risk' },
      { metric_name: 'Incident Rate (TRIR)', org_value: 1.2, industry_avg: 2.8, top_quartile: 0.9, category: 'incident_rate' },
      { metric_name: 'Compliance %', org_value: 94, industry_avg: 85, top_quartile: 98, category: 'compliance' },
      { metric_name: 'Training Completion', org_value: 88, industry_avg: 72, top_quartile: 95, category: 'training' },
      { metric_name: 'Near Miss Reporting', org_value: 15, industry_avg: 8, top_quartile: 20, category: 'leading_indicator' }
    ];
  }
};