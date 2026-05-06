import { supabase } from '@/lib/customSupabaseClient';

export const siteSearchService = {
  async searchSites(orgId, query) {
    if (!query || query.length < 2) return [];

    // Search by name or address
    const { data, error } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', orgId)
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Site search error:', error);
      return [];
    }

    return data;
  },

  async getSitesByOrganization(orgId) {
    const { data, error } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');

    if (error) throw error;
    return data;
  },

  // Basic coordinate proximity search (client-side filter for simplicity unless PostGIS is enabled)
  async searchSitesByCoordinates(orgId, lat, lng, radiusKm = 5) {
    const { data, error } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', orgId)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    // Simple Haversine formula
    return data.filter(site => {
      const d = this.calculateDistance(lat, lng, site.latitude, site.longitude);
      return d <= radiusKm;
    });
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
};