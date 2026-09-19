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
     * Health dashboard KPIs. The record-derived counts used to be read from
     * `hse.health_records` through supabase.schema('hse'), which PostgREST
     * does not expose on this project (PGRST106), so they always failed. That
     * table also has no writer anywhere in the app and holds no rows, so
     * there is no health-record data to count: the counts are honestly 0 and
     * the charts empty, without a request that can only fail. The
     * vaccination rate is the latest `vaccination_rate` from
     * `public.health_metrics`, or null (rendered '--') when none is recorded.
     */
    getHealthStats: async (orgId) => {
        const empty = { totalMonitored: 0, recordsThisMonth: 0, exposureIncidents: 0, vaccinationRate: null };
        if (!orgId) return empty;
        try {
            const { data } = await supabase.from('health_metrics').select('value').eq('organization_id', orgId).ilike('metric_name', 'vaccination_rate').order('recorded_at', { ascending: false }).limit(1);
            const vaxValue = data?.[0]?.value;
            return { ...empty, vaccinationRate: vaxValue == null ? null : Math.round(Number(vaxValue)) };
        } catch (e) {
            console.error('Error getting health stats:', e);
            return empty;
        }
    },

    /**
     * Health dashboard charts. No health-record source exists (see
     * getHealthStats), so both series are empty and the dashboard shows its
     * "No health records yet." state.
     */
    getHealthCharts: async () => ({ statusDistribution: [], exposureTrend: [] }),

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