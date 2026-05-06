import { supabase } from '@/lib/customSupabaseClient';

export const integrationService = {
  async getApiKeys(orgId) {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('org_id', orgId);
    return data || [];
  },

  async createApiKey(orgId, label, scopes) {
    // In reality, we generate a secure key, hash it for DB, show original ONCE to user
    const rawKey = `pk_live_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const keyHash = btoa(rawKey); // Simple encoding for demo (use proper hashing in backend)
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        key_prefix: rawKey.substring(0, 8),
        key_hash: keyHash,
        label,
        scopes,
        is_active: true
      })
      .select()
      .single();
      
    if (error) throw error;
    return { ...data, rawKey }; // Return raw key only once
  },

  async revokeKey(id) {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  async getWebhooks(orgId) {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('org_id', orgId);
    return data || [];
  },

  async createWebhook(webhook) {
    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhook)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLogs(orgId) {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }
};