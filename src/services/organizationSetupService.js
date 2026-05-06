import { supabase } from '@/lib/customSupabaseClient';

export const organizationSetupService = {
  
  async getOrganizationDetails(orgId) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrganizationDetails(orgId, updates) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDepartments(orgId) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createDepartment(department) {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPositions(orgId) {
    const { data, error } = await supabase
      .from('positions')
      .select('*, departments(name)')
      .eq('organization_id', orgId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createPosition(position) {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSites(orgId) {
    const { data, error } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createSite(site) {
    const { data, error } = await supabase
      .from('organization_sites')
      .insert(site)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrgUsers(orgId) {
    // Using RPC to get users safely
    const { data, error } = await supabase.rpc('get_users_for_organization', { org_id: orgId });
    if (error) throw error;
    return data;
  },

  async assignKeyPersonnel(assignment) {
    const { data, error } = await supabase
      .from('key_personnel')
      .upsert(assignment, { onConflict: 'organization_id, role' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getKeyPersonnel(orgId) {
    const { data, error } = await supabase
      .from('key_personnel')
      .select('*, users:user_id(email)') 
      .eq('organization_id', orgId);
    if (error) throw error;
    return data;
  },

  async completeSetup(orgId) {
    const { data, error } = await supabase
      .from('organizations')
      .update({ 
        setup_completed: true, 
        setup_completed_at: new Date().toISOString() 
      })
      .eq('id', orgId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};