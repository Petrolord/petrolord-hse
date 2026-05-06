import { supabase } from '@/lib/customSupabaseClient';

export const envPermitService = {
  async getPermits(orgId) {
    const { data, error } = await supabase
      .from('env_permits')
      .select('*')
      .eq('org_id', orgId)
      .order('expiry_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createPermit(payload) {
    const { data, error } = await supabase.from('env_permits').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  async getObligations(orgId) {
    const { data, error } = await supabase.from('env_obligations').select('*').eq('org_id', orgId);
    if (error) throw error;
    return data;
  }
};