import { supabase } from '@/lib/customSupabaseClient';

export const environmentService = {
  // --- Dashboard Stats ---
  async getDashboardStats(orgId) {
    try {
      const [permits, emp, flaring, spills, waste] = await Promise.all([
        supabase.from('environment_permits').select('*').eq('org_id', orgId),
        supabase.from('environment_emp_actions').select('*').eq('org_id', orgId),
        supabase.from('environment_flaring_logs').select('volume_m3').eq('org_id', orgId), // Simplify for summary
        supabase.from('environment_spill_reports').select('*').eq('org_id', orgId),
        supabase.from('environment_waste_manifests').select('quantity').eq('org_id', orgId)
      ]);

      const permitsDueSoon = permits.data?.filter(p => new Date(p.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length || 0;
      const empOverdue = emp.data?.filter(a => a.status !== 'Closed' && new Date(a.due_date) < new Date()).length || 0;
      const totalFlaring = flaring.data?.reduce((acc, curr) => acc + (curr.volume_m3 || 0), 0) || 0;
      const totalWaste = waste.data?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;

      return {
        complianceScore: 85, // Mock calc
        permitsDueSoon,
        empOverdue,
        totalFlaring,
        totalSpills: spills.data?.length || 0,
        totalWaste
      };
    } catch (e) {
      console.error(e);
      return {};
    }
  },

  // --- Facilities ---
  async getFacilities(orgId) {
    const { data } = await supabase.from('environment_facilities').select('*').eq('org_id', orgId);
    return data || [];
  },

  // --- Permits ---
  async getPermits(orgId) {
    const { data } = await supabase.from('environment_permits').select('*').eq('org_id', orgId).order('expiry_date', { ascending: true });
    return data || [];
  },
  async createPermit(payload) {
    const { data, error } = await supabase.from('environment_permits').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // --- EMP ---
  async getEMPActions(orgId) {
    const { data } = await supabase.from('environment_emp_actions').select('*').eq('org_id', orgId).order('due_date', { ascending: true });
    return data || [];
  },

  // --- Monitoring ---
  async getMonitoringResults(orgId) {
    const { data } = await supabase.from('environment_monitoring_results').select('*').eq('org_id', orgId).order('sample_date', { ascending: false });
    return data || [];
  },
  async logMonitoringData(payload) {
    const { data, error } = await supabase.from('environment_monitoring_results').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // --- Emissions ---
  async getFlaringLogs(orgId) {
    const { data } = await supabase.from('environment_flaring_logs').select('*').eq('org_id', orgId).order('log_date', { ascending: false });
    return data || [];
  },
  
  // --- Waste ---
  async getWasteManifests(orgId) {
    const { data } = await supabase.from('environment_waste_manifests').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
    return data || [];
  },

  // --- Spills ---
  async getSpills(orgId) {
    const { data } = await supabase.from('environment_spill_reports').select('*').eq('org_id', orgId).order('incident_date', { ascending: false });
    return data || [];
  },
  async createSpillReport(payload) {
    const { data, error } = await supabase.from('environment_spill_reports').insert(payload).select().single();
    if (error) throw error; return data;
  }
};

export const fetchEnvironmentData = async (orgId) => {
  const stats = await environmentService.getDashboardStats(orgId);
  return {
    ...stats,
    environmental_score: stats.complianceScore || 0
  };
};