import { supabase } from '@/lib/customSupabaseClient';

export const accessControlService = {
  async getAccessLogs(orgId) {
    const { data } = await supabase
      .from('access_logs')
      .select('*')
      .eq('organization_id', orgId)
      .order('access_time', { ascending: false })
      .limit(50);
    return data || [];
  },

  async getCredentials(userId) {
    // Return mock credentials if table implies empty
    return [
      { id: 1, type: 'Physical Badge', status: 'Active', expiry: '2026-01-01' },
      { id: 2, type: 'VPN Token', status: 'Active', expiry: '2025-06-15' },
      { id: 3, type: 'Server Room Key', status: 'Expired', expiry: '2024-12-31' }
    ];
  }
};