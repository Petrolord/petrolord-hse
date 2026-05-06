import { supabase } from '@/lib/customSupabaseClient';

export const riskMitigationService = {
  async getActions(riskId) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .select('*')
      .eq('risk_id', riskId);
    if (error) throw error;
    return data;
  },
  
  async updateStatus(id, status, progress) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .update({ status, progress, updated_at: new Date() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
};