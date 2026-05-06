import { supabase } from '@/lib/customSupabaseClient';

export const worldHeatmapService = {
  async getWorldHeatmapData(orgId) {
    try {
      // 1. Fetch Sites for the Organization (to get coordinates)
      const { data: sites, error: sitesError } = await supabase
        .from('organization_sites')
        .select('id, name, latitude, longitude, address')
        .eq('organization_id', orgId);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      // 2. Fetch Incidents for the Organization
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('id, site_id, severity, status')
        .eq('organization_id', orgId);

      if (incidentsError) throw incidentsError;

      // 3. Aggregate Incidents by Site
      const siteMap = sites.map(site => {
        const siteIncidents = incidents.filter(inc => inc.site_id === site.id);
        
        // Calculate Risk Level based on severity of active incidents
        let riskScore = 0;
        siteIncidents.forEach(inc => {
          if (inc.status !== 'Closed') {
             if (inc.severity === 'Critical') riskScore += 5;
             else if (inc.severity === 'High') riskScore += 3;
             else if (inc.severity === 'Medium') riskScore += 2;
             else riskScore += 1;
          }
        });

        let riskLevel = 'None';
        if (riskScore > 10) riskLevel = 'Critical';
        else if (riskScore > 5) riskLevel = 'High';
        else if (riskScore > 2) riskLevel = 'Medium';
        else if (riskScore > 0) riskLevel = 'Low';

        // Default to 0,0 if no coords (will be filtered out later or shown at null island)
        const lon = site.longitude ? parseFloat(site.longitude) : 0;
        const lat = site.latitude ? parseFloat(site.latitude) : 0;

        return {
          id: site.id,
          name: site.name,
          coordinates: [lon, lat], // GeoJSON uses [lon, lat]
          total: siteIncidents.length,
          active: siteIncidents.filter(i => i.status !== 'Closed').length,
          riskLevel,
          riskScore
        };
      });

      // Filter out sites with invalid coordinates (0,0 is often default for null)
      // You might want to keep them if you have a list view, but for map we filter.
      return siteMap.filter(s => s.coordinates[0] !== 0 || s.coordinates[1] !== 0);

    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return [];
    }
  }
};