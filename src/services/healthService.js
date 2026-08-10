import { supabase } from '../lib/customSupabaseClient';

/**
 * Real health score for the dashboard — reads the latest `health_score` metric
 * from the `health_metrics` table. Returns null (not a mock fallback) when the
 * org has no recorded score, so the dashboard shows an honest '--'.
 */
export const getHealthScore = async (organizationId) => {
  if (!organizationId) return null;
  const { data, error } = await supabase
    .from('health_metrics')
    .select('value, recorded_at')
    .eq('organization_id', organizationId)
    .ilike('metric_name', 'health_score')
    .order('recorded_at', { ascending: false })
    .limit(1);

  if (error || !data?.length || data[0].value == null) return null;
  return Math.round(Number(data[0].value));
};

/**
 * Health Service object
 */
export const healthService = {
    /**
     * Real dashboard stats from the `hse.health_records` table (org-scoped) plus
     * the latest `vaccination_rate` from `public.health_metrics`. Returns honest
     * zeros for an org with no records, and `vaccinationRate: null` when no
     * metric has been recorded (the dashboard renders that as '--').
     */
    getHealthStats: async (orgId) => {
        const empty = { totalMonitored: 0, recordsThisMonth: 0, exposureIncidents: 0, vaccinationRate: null };
        if (!orgId) return empty;
        try {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const hse = supabase.schema('hse');
            const [employees, monthly, exposure, vaccination] = await Promise.all([
                // Distinct employees with at least one health record.
                hse.from('health_records').select('user_id').eq('org_id', orgId),
                hse.from('health_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId).gte('created_at', startOfMonth),
                hse.from('health_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId).ilike('record_type', '%exposure%'),
                supabase.from('health_metrics').select('value').eq('organization_id', orgId).ilike('metric_name', 'vaccination_rate').order('recorded_at', { ascending: false }).limit(1),
            ]);

            const totalMonitored = new Set((employees.data || []).map(r => r.user_id).filter(Boolean)).size;
            const vaxValue = vaccination.data?.[0]?.value;
            return {
                totalMonitored,
                recordsThisMonth: monthly.count || 0,
                exposureIncidents: exposure.count || 0,
                vaccinationRate: vaxValue == null ? null : Math.round(Number(vaxValue)),
            };
        } catch (e) {
            console.error('Error getting health stats:', e);
            return empty;
        }
    },

    /**
     * Real chart data for the Health dashboard, derived from a single
     * `hse.health_records` read (org-scoped):
     *   - statusDistribution: record count grouped by status (pie chart)
     *   - exposureTrend: exposure-typed records per month for the last 6 months (line chart)
     * Both return [] / all-zero when the org has no relevant records, so the
     * dashboard can show an honest empty state instead of a fabricated chart.
     */
    getHealthCharts: async (orgId) => {
        const empty = { statusDistribution: [], exposureTrend: [] };
        if (!orgId) return empty;
        try {
            const { data, error } = await supabase.schema('hse')
                .from('health_records')
                .select('status, record_type, created_at')
                .eq('org_id', orgId);
            if (error) throw error;
            const rows = data || [];

            // Pie: distribution by status.
            const statusCounts = {};
            rows.forEach(r => {
                const key = r.status || 'Unknown';
                statusCounts[key] = (statusCounts[key] || 0) + 1;
            });
            const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

            // Line: exposure records per month over the trailing 6 months.
            const now = new Date();
            const months = [];
            const monthIndex = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthIndex[key] = months.length;
                months.push({ month: d.toLocaleString('default', { month: 'short' }), exposures: 0 });
            }
            rows.forEach(r => {
                if (!r.record_type || !/exposure/i.test(r.record_type) || !r.created_at) return;
                const d = new Date(r.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (key in monthIndex) months[monthIndex[key]].exposures += 1;
            });

            return { statusDistribution, exposureTrend: months };
        } catch (e) {
            console.error('Error getting health charts:', e);
            return empty;
        }
    },

    getHealthRecords: async (orgId, filters) => {
        try {
            let query = supabase
                .from('incidents')
                .select('*')
                .eq('organization_id', orgId)
                .eq('hazard_category', 'Health')
                .order('incident_date', { ascending: false });

            if (filters?.userId && filters.userId !== 'all') {
                // Assuming we store the subject user in people_involved or created_by for now
                // This is a simplification
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching health records:', error);
            return [];
        }
    },

    createHealthRecord: async (payload) => {
        try {
            const dbPayload = {
                organization_id: payload.org_id,
                title: `${payload.record_type} - ${payload.status}`,
                report_type: payload.record_type,
                hazard_category: 'Health',
                description: payload.details?.description || '',
                status: payload.status,
                incident_date: payload.created_at,
                created_by: payload.created_by,
                // Store extra details in metadata/actions
                actions: payload.details
            };

            const { data, error } = await supabase
                .from('incidents')
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating health record:', error);
            throw error;
        }
    }
};