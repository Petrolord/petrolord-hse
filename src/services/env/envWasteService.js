import { supabase } from '@/lib/customSupabaseClient';

export const envWasteService = {
  async getManifests(orgId) {
    const { data, error } = await supabase
      .from('env_waste_manifests')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async createManifest(payload) {
    const { data, error } = await supabase.from('env_waste_manifests').insert(payload).select().single();
    if (error) throw error;
    return data;
  }
};