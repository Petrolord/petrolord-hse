import { supabase } from '@/lib/customSupabaseClient';

export const behavioralAnalyticsService = {
  async getAnomalies(orgId) {
    const { data } = await supabase
      .from('behavioral_anomalies')
      .select('*')
      .eq('organization_id', orgId)
      .order('detected_date', { ascending: false });
    return data || [];
  }
};