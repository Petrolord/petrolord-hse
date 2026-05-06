import { supabase } from '@/lib/customSupabaseClient';

export const orgSettingsService = {
  // --- Departments ---
  async getDepartments(orgId) {
    const { data, error } = await supabase
      .from('departments')
      .select('*, manager:manager_id(email, id), user_profiles(count)')
      .eq('org_id', orgId)
      .order('name');
      
    if (error) throw error;
    
    // Flatten member count
    return data.map(d => ({
      ...d,
      member_count: d.user_profiles?.[0]?.count || 0
    }));
  },

  async upsertDepartment(dept) {
    const { data, error } = await supabase
      .from('departments')
      .upsert(dept)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDepartment(id) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Compliance Rules ---
  async getComplianceRules(orgId) {
    const { data, error } = await supabase
      .from('compliance_rules')
      .select('*, responsible:responsible_person_id(email)')
      .eq('org_id', orgId)
      .order('due_date');
    if (error) throw error;
    return data;
  },

  async upsertComplianceRule(rule) {
    const { data, error } = await supabase
      .from('compliance_rules')
      .upsert(rule)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComplianceRule(id) {
    const { error } = await supabase.from('compliance_rules').delete().eq('id', id);
    if (error) throw error;
  },

  // --- User Profile ---
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async upsertUserProfile(profile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('org-assets')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(fileName);
      
    return publicUrl;
  },

  async updateUserPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // --- Activity Logs ---
  async getActivityLogs(userId) {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  },

  async logActivity(userId, action, details = {}) {
    await supabase.from('user_activity_logs').insert({ user_id: userId, action, details });
  }
};