import { supabase } from '@/lib/customSupabaseClient';

export const contractorService = {
  // --- Core Contractor Functions ---
  async getContractors(orgId, filters = {}) {
    let query = supabase
      .schema('hse')
      .from('contractors')
      .select(`
        *,
        site:assigned_site_id(name)
      `)
      .eq('org_id', orgId);

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.search) query = query.ilike('company_name', `%${filters.search}%`);
    if (filters.safetyRating && filters.safetyRating !== 'all') query = query.gte('safety_rating', parseInt(filters.safetyRating));
    if (filters.tier && filters.tier !== 'all') query = query.eq('tier', filters.tier);

    const { data, error } = await query.order('company_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createContractor(contractor) {
    const { data, error } = await supabase
      .schema('hse')
      .from('contractors')
      .insert(contractor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateContractor(id, updates) {
    const { data, error } = await supabase.schema('hse').from('contractors').update(updates).eq('id', id).select().single();
    if (error) throw error; return data;
  },

  // --- Inductions ---
  async getInductions(orgId, filters = {}) {
    let query = supabase.schema('hse').from('safety_inductions').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error; return data;
  },

  async createInduction(induction) {
    const { data, error } = await supabase.schema('hse').from('safety_inductions').insert(induction).select().single();
    if (error) throw error; return data;
  },

  // --- Safety Briefings ---
  async getBriefings(orgId) {
    // Mocking if table doesn't exist yet, or using generic table if available
    const { data, error } = await supabase.schema('hse').from('safety_briefings').select('*').eq('org_id', orgId).order('date', { ascending: false });
    if (error && error.code !== '42P01') throw error; 
    return data || []; 
  },

  // --- Permits ---
  async getPermits(orgId) {
    const { data, error } = await supabase.schema('hse').from('work_permits').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('created_at', { ascending: false });
    if (error) throw error; return data;
  },

  // --- Incident Reporting ---
  async getContractorIncidents(orgId) {
    const { data, error } = await supabase.schema('hse').from('contractor_incidents').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error; return data;
  },

  // --- Training & Competency ---
  async getTrainingRecords(orgId) {
    const { data, error } = await supabase.schema('hse').from('training_records').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error; return data;
  },

  async getCompetencyRecords(orgId) {
    const { data, error } = await supabase.schema('hse').from('competency_records').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('expiry_date', { ascending: true });
    if (error) throw error; return data;
  },

  // --- Performance & Compliance ---
  async getPerformanceReviews(orgId) {
    const { data, error } = await supabase.schema('hse').from('contractor_reviews').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
    if (error) throw error; return data;
  },

  async getComplianceRecords(orgId) {
    const { data, error } = await supabase.schema('hse').from('compliance_checklists').select(`*, contractor:contractor_id(company_name)`).eq('org_id', orgId).order('date', { ascending: false });
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