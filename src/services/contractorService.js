import { supabase } from '@/lib/customSupabaseClient';
import { blankIdsToNull } from './registerPayload';

// Contractor Safety tables are public.hse_* (migration
// 20260919150000_hse_public_registers.sql), scoped by `org_id` and by RLS.
// They used to be read through supabase.schema('hse'), which PostgREST does
// not expose on this project (PGRST106), so the contractor list, inductions,
// incidents and "Add Contractor" all failed in production. Permits come from
// the Work Permits module's own table, public.work_permits.
export const contractorService = {
  // --- Core Contractor Functions ---
  async getContractors(orgId, filters = {}) {
    let query = supabase
      .from('hse_contractors')
      .select(`
        *,
        site:assigned_site_id(name)
      `)
      .eq('org_id', orgId);

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.search) query = query.ilike('company_name', `%${filters.search}%`);
    if (filters.safetyRating && filters.safetyRating !== 'all') query = query.gte('safety_rating', parseInt(filters.safetyRating));
    // No tier filter: the table has no tier column (the UI shows 'Tier 3' as a
    // placeholder), and filtering on a missing column fails the whole read.

    const { data, error } = await query.order('company_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createContractor(contractor) {
    const { data, error } = await supabase
      .from('hse_contractors')
      .insert(blankIdsToNull(contractor))
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateContractor(id, updates) {
    const { data, error } = await supabase.from('hse_contractors').update(blankIdsToNull(updates)).eq('id', id).select().single();
    if (error) throw error; return data;
  },

  // --- Inductions ---
  async getInductions(orgId, filters = {}) {
    let query = supabase.from('hse_safety_inductions').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error; return data;
  },

  async createInduction(induction) {
    const { data, error } = await supabase.from('hse_safety_inductions').insert(blankIdsToNull(induction)).select().single();
    if (error) throw error; return data;
  },

  // --- Permits ---
  // public.work_permits is the Work Permits module's table (organization_id,
  // contractor_name; no contractor FK), so there is no contractor embed.
  async getPermits(orgId) {
    const { data, error } = await supabase
      .from('work_permits')
      .select('id, permit_number, status, contractor_name, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(p => ({ ...p, contractor: p.contractor_name ? { company_name: p.contractor_name } : null }));
  },

  // --- Incident Reporting ---
  async getContractorIncidents(orgId) {
    const { data, error } = await supabase.from('hse_contractor_incidents').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error; return data;
  },

  // --- Training & Competency ---
  async getTrainingRecords(orgId) {
    const { data, error } = await supabase.from('hse_training_records').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error; return data;
  },

  async getCompetencyRecords(orgId) {
    const { data, error } = await supabase.from('hse_competency_records').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('expiry_date', { ascending: true });
    if (error) throw error; return data;
  },

  // --- Dashboard Analytics ---
  async getDashboardMetrics(orgId) {
    // This would typically involve multiple specific queries or an RPC call
    // For now, we fetch lists and aggregate on client or assume light load
    const [contractors, incidents, permits] = await Promise.all([
      this.getContractors(orgId),
      this.getContractorIncidents(orgId),
      this.getPermits(orgId)
    ]);

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const incidentDate = (i) => new Date(i.date || i.created_at);
    const incidentsYTD = incidents.filter(i => incidentDate(i) >= yearStart);

    // Recent activity built from the records fetched above (newest first).
    const recentActivity = [
      ...contractors.map(c => ({ id: `c-${c.id}`, type: 'Contractor', message: `Contractor "${c.company_name}" added`, at: c.created_at })),
      ...permits.map(p => ({ id: `p-${p.id}`, type: 'Permit', message: `Permit${p.permit_number ? ` ${p.permit_number}` : ''}${p.contractor?.company_name ? ` for ${p.contractor.company_name}` : ''}${p.status ? ` (${p.status})` : ''}`, at: p.created_at })),
      ...incidents.map(i => ({ id: `i-${i.id}`, type: 'Incident', message: `${i.incident_type || 'Incident'} reported${i.contractor?.company_name ? ` for ${i.contractor.company_name}` : ''}`, at: i.date || i.created_at })),
    ]
      .filter(e => e.at)
      .sort((x, y) => new Date(y.at) - new Date(x.at))
      .slice(0, 4);

    return {
      totalContractors: contractors.length,
      activeContractors: contractors.filter(c => c.status === 'Active').length,
      totalIncidents: incidentsYTD.length,
      criticalIncidents: incidentsYTD.filter(i => (i.severity || '').toLowerCase() === 'critical').length,
      openPermits: permits.filter(p => p.status === 'Open' || p.status === 'Active').length,
      recentActivity,
    };
  }
};