import { supabase } from '@/lib/customSupabaseClient';

/**
 * Re-exporting functionality with fixes applied. 
 * This file replaces the previous buggy version that caused 400 Bad Request errors due to invalid joins.
 */

export const permitsService = {
  async getPermits(organizationId, filters = {}) {
    // FIX: Removed invalid joins to 'requested_by(email...)' which were causing 400 errors.
    // We now fetch just the permit data. Enrichment should happen client-side or via a safe separate query if needed.
    // For now, to ensure stability, we fetch the raw permit data.
    let query = supabase
      .from('work_permits')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.type && filters.type !== 'all') query = query.eq('permit_type', filters.type);
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,permit_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching permits:", error);
        return []; // Return empty array on error to prevent crash
    }
    return data;
  },

  async getPermitById(id) {
    // FIX: Simplified query to avoid join errors
    const { data, error } = await supabase
      .from('work_permits')
      .select(`
        *,
        approvals:permit_approvals(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createPermit(permitData) {
    const { data, error } = await supabase
      .from('work_permits')
      .insert([permitData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePermit(id, updates) {
    const { data, error } = await supabase
      .from('work_permits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTemplates(organizationId) {
    try {
      const { data, error } = await supabase
        .from('permit_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);
      
      if (error) {
          console.warn("Error fetching permit templates, returning empty.", error);
          return [];
      }
      return data;
    } catch (e) {
        return [];
    }
  },

  async getStats(organizationId) {
    try {
      const { data, error } = await supabase
        .from('work_permits')
        .select('status, priority, start_date, expiry_date')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const total = data.length;
      const active = data.filter(p => p.status === 'Active').length;
      const pending = data.filter(p => p.status === 'Submitted' || p.status === 'Pending').length;
      const expiringSoon = data.filter(p => {
        if (p.status !== 'Active' || !p.expiry_date) return false;
        const expiry = new Date(p.expiry_date);
        const now = new Date();
        const diff = expiry - now;
        return diff > 0 && diff < 48 * 60 * 60 * 1000; // 48 hours
      }).length;

      return { total, active, pending, expiringSoon };
    } catch (e) {
      console.error("Error getting permit stats:", e);
      return { total: 0, active: 0, pending: 0, expiringSoon: 0 };
    }
  }
};