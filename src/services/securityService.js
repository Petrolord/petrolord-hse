import { supabase } from '../lib/customSupabaseClient';

/**
 * Security service. The live security incident flow (logging + lists) goes
 * through `incidentService` against `public.security_incidents`; this service
 * provides the org-scoped aggregations the Security dashboard and analytics
 * read from that same table. No mock data — empty orgs return honest zeros/[].
 */
export const securityService = {
  /**
   * Aggregated security statistics for the Security dashboard cards:
   *   - incidentsYTD: security_incidents reported this calendar year
   *   - pendingTrainings: upcoming scheduled training sessions
   *   - expiringCredentials: competencies expiring within the next 30 days
   */
  getSecurityStats: async (orgId) => {
    const empty = { incidentsYTD: 0, pendingTrainings: 0, expiringCredentials: 0 };
    if (!orgId) return empty;
    try {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
      const today = now.toISOString().slice(0, 10);
      const nowIso = now.toISOString();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const hse = supabase.schema('hse');

      const [incidents, pending, expiring] = await Promise.all([
        supabase.from('security_incidents').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).gte('incident_date', yearStart),
        hse.from('training_schedule').select('id', { count: 'exact', head: true }).eq('org_id', orgId).gte('scheduled_date', today),
        hse.from('competency_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId).not('expiry_date', 'is', null).gte('expiry_date', nowIso).lte('expiry_date', in30Days),
      ]);

      return {
        incidentsYTD: incidents.count || 0,
        pendingTrainings: pending.count || 0,
        expiringCredentials: expiring.count || 0,
      };
    } catch (e) {
      console.error('Error getting security stats:', e);
      return empty;
    }
  },

  /**
   * Total count of security incidents for an org. Used by the main HSE
   * dashboard tile.
   */
  getIncidentCount: async (orgId) => {
    if (!orgId) return 0;
    const { count, error } = await supabase
      .from('security_incidents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error counting security incidents:', error);
      return 0;
    }
    return count || 0;
  },

  /**
   * Chart data for the Security Analytics tab, derived from a single
   * `security_incidents` read (org-scoped):
   *   - severityDistribution: incident count by severity (pie), ordered
   *     Critical -> High -> Medium -> Low so the red->green palette lines up
   *   - incidentTrend: incidents per month over the trailing 6 months (line)
   * Returns []/all-zero when the org has no incidents.
   */
  getIncidentAnalytics: async (orgId) => {
    const empty = { severityDistribution: [], incidentTrend: [] };
    if (!orgId) return empty;
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('severity, incident_date')
        .eq('organization_id', orgId);
      if (error) throw error;
      const rows = data || [];

      // Pie: count by severity, in a fixed high->low order.
      const order = ['Critical', 'High', 'Medium', 'Low'];
      const counts = {};
      rows.forEach(r => {
        const key = r.severity || 'Unspecified';
        counts[key] = (counts[key] || 0) + 1;
      });
      const ordered = [
        ...order.filter(s => counts[s]),
        ...Object.keys(counts).filter(s => !order.includes(s)),
      ];
      const severityDistribution = ordered.map(name => ({ name, value: counts[name] }));

      // Line: incidents per month over the trailing 6 months.
      const now = new Date();
      const months = [];
      const monthIndex = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthIndex[key] = months.length;
        months.push({ month: d.toLocaleString('default', { month: 'short' }), incidents: 0 });
      }
      rows.forEach(r => {
        if (!r.incident_date) return;
        const d = new Date(r.incident_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthIndex) months[monthIndex[key]].incidents += 1;
      });

      return { severityDistribution, incidentTrend: months };
    } catch (e) {
      console.error('Error getting incident analytics:', e);
      return empty;
    }
  },
};
