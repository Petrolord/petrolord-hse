import { supabase } from '../lib/customSupabaseClient';

/**
 * Get mock health data
 */
const getMockHealthData = () => {
  return {
    total_employees: 245,
    health_incidents: 3,
    occupational_diseases: 1,
    medical_checkups_completed: 198,
    vaccination_rate: 92,
    health_score: 88,
    recent_incidents: [
      {
        id: 1,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Minor Injury',
        description: 'Cut on hand during equipment maintenance',
        severity: 'low',
      },
      {
        id: 2,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Heat Stress',
        description: 'Employee suffered heat exhaustion',
        severity: 'medium',
      },
    ],
  };
};

/**
 * Fetch health data (Legacy function kept for compatibility)
 */
export const fetchHealthData = async (organizationId) => {
  try {
    if (!organizationId) return getMockHealthData();

    const { data, error } = await supabase
      .from('health_metrics') // Assuming this view/table exists or we fallback
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data?.length) return getMockHealthData();
    return { ...getMockHealthData(), ...data[0] };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return getMockHealthData();
  }
};

/**
 * Health Service object
 */
export const healthService = {
    getHealthStats: async (orgId) => {
        const data = await fetchHealthData(orgId);
        return {
            totalMonitored: data.total_employees,
            recordsThisMonth: data.medical_checkups_completed,
            exposureIncidents: data.health_incidents,
            vaccinationRate: data.vaccination_rate,
            ...data
        };
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

    getExposureLogs: async (orgId, filters) => {
        // Mock exposure logs
        return [
            { id: 1, employee: "John Doe", substance: "Benzene", level: "0.5 ppm", date: new Date().toISOString() }
        ];
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