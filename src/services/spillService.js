import { supabase } from '@/lib/customSupabaseClient';

export const spillService = {
  async getSpills(orgId, filters = {}) {
    let query = supabase.schema('hse').from('spill_records').select('*').eq('org_id', orgId);
    if (filters.severity && filters.severity !== 'all') query = query.eq('severity', filters.severity);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getResponses(orgId) {
    const { data, error } = await supabase.schema('hse').from('spill_response').select('*, spill:spill_id(*)').eq('org_id', orgId);
    if (error) throw error;
    return data;
  },
  async createSpill(spill) {
    const { data, error } = await supabase.schema('hse').from('spill_records').insert(spill).select().single();
    if (error) throw error;
    return data;
  },
  async createResponse(response) {
    const { data, error } = await supabase.schema('hse').from('spill_response').insert(response).select().single();
    if (error) throw error;
    return data;
  }
};