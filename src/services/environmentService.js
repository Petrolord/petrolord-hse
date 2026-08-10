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

      // Computed compliance figure (replaces the old literal 85). Two equally
      // weighted factors — share of permits still valid and share of EMP actions
      // on-track — each open spill subtracts 5 points. Null when there is no
      // permit or EMP data to base it on, so the dashboard shows '--'.
      const totalPermits = permits.data?.length || 0;
      const validPermits = permits.data?.filter(p => p.expiry_date && new Date(p.expiry_date) > new Date()).length || 0;
      const totalEmp = emp.data?.length || 0;
      const empOnTrack = totalEmp - empOverdue;
      const totalSpills = spills.data?.length || 0;

      const factors = [];
      if (totalPermits > 0) factors.push(validPermits / totalPermits);
      if (totalEmp > 0) factors.push(empOnTrack / totalEmp);

      let complianceScore = null;
      if (factors.length > 0) {
        const base = (factors.reduce((a, b) => a + b, 0) / factors.length) * 100;
        complianceScore = Math.max(0, Math.min(100, Math.round(base - totalSpills * 5)));
      }

      return {
        complianceScore,
        permitsDueSoon,
        empOverdue,
        totalFlaring,
        totalSpills,
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

  // --- Studies (EIA / EER cyclical studies) ---
  async getStudies(orgId) {
    const { data } = await supabase.from('environment_studies').select('*').eq('org_id', orgId).order('next_due_date', { ascending: true });
    return data || [];
  },

  // --- Permits ---
  async getPermits(orgId) {
    const { data } = await supabase.from('environment_permits').select('*').eq('org_id', orgId).order('expiry_date', { ascending: true });
    return data || [];
  },
  async createPermit(payload) {
    if (!payload?.org_id) throw new Error('createPermit requires org_id');
    const { data, error } = await supabase.from('environment_permits').insert(payload).select().single();
    if (error) throw error; return data;
  },
  async updatePermit(id, patch) {
    const { data, error } = await supabase.from('environment_permits').update(patch).eq('id', id).select().single();
    if (error) throw error; return data;
  },
  async deletePermit(id) {
    const { error } = await supabase.from('environment_permits').delete().eq('id', id);
    if (error) throw error; return true;
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
    if (!payload?.org_id) throw new Error('logMonitoringData requires org_id');
    const { data, error } = await supabase.from('environment_monitoring_results').insert(payload).select().single();
    if (error) throw error; return data;
  },
  async updateMonitoringData(id, patch) {
    const { data, error } = await supabase.from('environment_monitoring_results').update(patch).eq('id', id).select().single();
    if (error) throw error; return data;
  },
  async deleteMonitoringData(id) {
    const { error } = await supabase.from('environment_monitoring_results').delete().eq('id', id);
    if (error) throw error; return true;
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
  async createWasteManifest(payload) {
    if (!payload?.org_id) throw new Error('createWasteManifest requires org_id');
    const { data, error } = await supabase.from('environment_waste_manifests').insert(payload).select().single();
    if (error) throw error; return data;
  },
  async updateWasteManifest(id, patch) {
    const { data, error } = await supabase.from('environment_waste_manifests').update(patch).eq('id', id).select().single();
    if (error) throw error; return data;
  },
  async deleteWasteManifest(id) {
    const { error } = await supabase.from('environment_waste_manifests').delete().eq('id', id);
    if (error) throw error; return true;
  },

  // --- Spills ---
  async getSpills(orgId) {
    const { data } = await supabase.from('environment_spill_reports').select('*').eq('org_id', orgId).order('incident_date', { ascending: false });
    return data || [];
  },
  async createSpillReport(payload) {
    if (!payload?.org_id) throw new Error('createSpillReport requires org_id');
    const { data, error } = await supabase.from('environment_spill_reports').insert(payload).select().single();
    if (error) throw error; return data;
  },
  async updateSpillReport(id, patch) {
    const { data, error } = await supabase.from('environment_spill_reports').update(patch).eq('id', id).select().single();
    if (error) throw error; return data;
  },
  async deleteSpillReport(id) {
    const { error } = await supabase.from('environment_spill_reports').delete().eq('id', id);
    if (error) throw error; return true;
  }
};

export const fetchEnvironmentData = async (orgId) => {
  const stats = await environmentService.getDashboardStats(orgId);
  return {
    ...stats,
    // Preserve null (no data) so the dashboard can show '--' rather than a fake 0%.
    environmental_score: stats.complianceScore ?? null
  };
};