import { supabase } from '@/lib/customSupabaseClient';

export const locationService = {
  async getLocations(siteId) {
    const { data, error } = await supabase
      .from('site_locations')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async searchLocations(orgId, query) {
    const { data, error } = await supabase
      .from('site_locations')
      .select(`
        *,
        site:organization_sites(name)
      `)
      .eq('organization_id', orgId)
      .ilike('name', `%${query}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },

  async createLocation(locationData) {
    const { data, error } = await supabase
      .from('site_locations')
      .insert([locationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLocation(id, updates) {
    const { data, error } = await supabase
      .from('site_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteLocation(id) {
    const { error } = await supabase
      .from('site_locations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};