import { supabase } from '@/lib/customSupabaseClient';

export const adminService = {
  // --- Organizations ---
  async getOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createOrganization(orgData) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([orgData])
      .select()
      .single();
    if (error) throw error;
    
    // Log Audit
    await this.logAudit('create_org', `Created organization: ${orgData.name}`, { org_id: data.id });
    return data;
  },

  async updateOrganization(id, updates) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await this.logAudit('update_org', `Updated organization: ${id}`, updates);
    return data;
  },

  async deleteOrganization(id) {
    // Note: Due to foreign key constraints, a cascade delete trigger or sequential deletion is needed usually.
    // For this implementation, we assume the DB function handles cleanup or we delete simply.
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) throw error;
    await this.logAudit('delete_org', `Deleted organization: ${id}`);
  },

  // --- Users ---
  async getUsers() {
    // Fetching from organization_users to get metadata (Real auth users require service key)
    const { data, error } = await supabase
      .from('organization_users')
      .select(`
        *,
        organization:organizations(name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createUserRecord(userData) {
    // This creates the record in organization_users. 
    // In a real app, you'd also hit auth.admin.createUser via Edge Function.
    const { data, error } = await supabase
      .from('organization_users')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    await this.logAudit('create_user', `Created user record for: ${userData.user_id}`, userData);
    return data;
  },

  async updateUserRecord(id, updates) {
    const { data, error } = await supabase
      .from('organization_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await this.logAudit('update_user', `Updated user: ${id}`, updates);
    return data;
  },

  async deleteUserRecord(id) {
    const { error } = await supabase.from('organization_users').delete().eq('id', id);
    if (error) throw error;
    await this.logAudit('delete_user', `Deleted user record: ${id}`);
  },

  // --- Roles & Permissions ---
  async getRoles() {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) throw error;
    return data;
  },

  // --- Audit ---
  async logAudit(action, details, metadata = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([{
      action,
      details: typeof details === 'string' ? { message: details } : details,
      actor_id: user?.id,
      created_at: new Date()
    }]);
  },

  async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  }
};