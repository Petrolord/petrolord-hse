import { supabase } from '@/lib/customSupabaseClient';

export const fireService = {
  async getRecords(orgId, filters = {}) {
    let query = supabase.schema('hse').from('fire_safety_records').select('*').eq('org_id', orgId);
    if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getDrills(orgId) {
    const { data, error } = await supabase.schema('hse').from('fire_drills').select('*').eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getEquipment(orgId) {
    const { data, error } = await supabase.schema('hse').from('fire_equipment').select('*').eq('org_id', orgId);
    if (error) throw error;
    return data;
  },
  async createRecord(record) {
    const { data, error } = await supabase.schema('hse').from('fire_safety_records').insert(record).select().single();
    if (error) throw error;
    return data;
  }
};