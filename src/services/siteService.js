import { supabase } from '@/lib/customSupabaseClient';

export const siteService = {
  async getSites(orgId) {
    const { data, error } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createSite(siteData) {
    const { data, error } = await supabase
      .from('organization_sites')
      .insert([siteData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSite(id, updates) {
    const { data, error } = await supabase
      .from('organization_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSite(id) {
    const { error } = await supabase
      .from('organization_sites')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // OpenStreetMap Nominatim Geocoding
  async searchAddress(query) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Geocoding error:", error);
      return [];
    }
  },

  async reverseGeocode(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }
};