import { supabase } from '@/lib/customSupabaseClient';

export const dataQualityService = {
  async getMetrics(organizationId) {
    const { data } = await supabase
      .from('data_quality_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('checked_at', { ascending: false })
      .limit(1);

    // Only a stored data-quality check is shown. With no check on record there is
    // nothing to report, so return null rather than built-in example scores.
    if (data && data.length > 0) return data[0];
    return null;
  }
};
