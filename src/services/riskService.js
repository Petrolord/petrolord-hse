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
    const { data, error } = await supabase
      .from('risk_register')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
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

  async createMitigation(action) {
    const { data, error } = await supabase
      .from('risk_mitigation_actions')
      .insert(action)
      .select()
      .single();
    if (error) throw error;
    return data;
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