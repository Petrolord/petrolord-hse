import { supabase } from '@/lib/customSupabaseClient';

export const riskService = {
  // --- Risk Register ---
  async getRisks(orgId, filters = {}) {
    let query = supabase
      .from('risk_register')
      .select(`
        *,
        owner:owner_id(email, raw_user_meta_data),
        mitigations:risk_mitigation_actions(count),
        kris:risk_kris(*)
      `)
      .eq('org_id', orgId);

    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query.order('risk_score', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRisk(risk) {
    if (!risk?.org_id) throw new Error('createRisk requires org_id');
    // Auto-calculate rating
    const score = risk.likelihood * risk.impact;
    let rating = 'Low';
    if (score >= 15) rating = 'Critical';
    else if (score >= 10) rating = 'High';
    else if (score >= 5) rating = 'Medium';

    const { data, error } = await supabase
      .from('risk_register')
      .insert({ ...risk, rating })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRisk(id, updates) {
    // Recompute rating when likelihood/impact change so it stays consistent.
    const patch = { ...updates, updated_at: new Date() };
    if (updates.likelihood != null && updates.impact != null) {
      const score = updates.likelihood * updates.impact;
      patch.rating = score >= 15 ? 'Critical' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low';
    }
    const { data, error } = await supabase
      .from('risk_register')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRisk(id) {
    const { error } = await supabase.from('risk_register').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Mitigation ---
  async getMitigations(riskId) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .select('*')
      .eq('risk_id', riskId);
    if (error) throw error;
    return data;
  },

  // All mitigation actions for an org, with their parent risk. Scoped via the
  // risk_register!inner join (risk_mitigation_actions has no org_id of its own).
  async getAllMitigations(orgId) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .select(`*, risk:risk_register!inner(id, risk_id, title, category, org_id)`)
      .eq('risk_register.org_id', orgId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createMitigation(action) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .insert(action)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMitigation(id, patch) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMitigation(id) {
    const { error } = await supabase.from('risk_mitigation_actions').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Scenarios (what-if planning) ---
  async getScenarios(orgId) {
    const { data, error } = await supabase
      .from('risk_scenarios')
      .select('*')
      .eq('org_id', orgId)
      .order('impact_financial', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createScenario(scenario) {
    if (!scenario?.org_id) throw new Error('createScenario requires org_id');
    const { data, error } = await supabase
      .from('risk_scenarios')
      .insert(scenario)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateScenario(id, patch) {
    const { data, error } = await supabase
      .from('risk_scenarios')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteScenario(id) {
    const { error } = await supabase.from('risk_scenarios').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- KRIs ---
  async getKRIs(orgId) {
    // Join with risk to filter by org
    const { data, error } = await supabase
      .from('risk_kris')
      .select(`*, risk:risk_register!inner(title, org_id)`)
      .eq('risk_register.org_id', orgId);
    if (error) throw error;
    return data;
  },

  // --- Dashboard Stats ---
  async getDashboardStats(orgId) {
    const { data: risks } = await supabase
      .from('risk_register')
      .select('risk_score, category, status')
      .eq('org_id', orgId);

    if (!risks) return { total: 0, critical: 0, avgScore: 0, byCategory: {}, byStatus: {} };

    const total = risks.length;
    const critical = risks.filter(r => r.risk_score >= 15).length;
    const avgScore = total ? Math.round(risks.reduce((a,b) => a + (b.risk_score||0), 0) / total) : 0;
    
    // Grouping
    const byCategory = risks.reduce((acc, r) => { acc[r.category] = (acc[r.category]||0)+1; return acc; }, {});
    const byStatus = risks.reduce((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});

    return { total, critical, avgScore, byCategory, byStatus };
  }
};