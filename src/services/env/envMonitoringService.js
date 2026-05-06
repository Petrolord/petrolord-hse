import { supabase } from '@/lib/customSupabaseClient';

export const envMonitoringService = {
  async getLogs(orgId) {
    const { data, error } = await supabase
      .from('env_monitoring_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('sample_date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async logData(payload) {
    const { data, error } = await supabase.from('env_monitoring_logs').insert(payload).select().single();
    if (error) throw error;
    return data;
  }
};