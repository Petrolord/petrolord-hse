import { supabase } from '@/lib/customSupabaseClient';

export const accessControlService = {
  /**
   * Recent access audit-log entries for an org from `public.access_logs`. The
   * UI renders `action` as the entry title, but the table has no `action`
   * column — compose one from the real `status`/`access_type` columns so the
   * title isn't blank.
   */
  async getAccessLogs(orgId) {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('access_logs')
      .select('id, access_type, resource_accessed, location, access_time, status')
      .eq('organization_id', orgId)
      .order('access_time', { ascending: false })
      .limit(50);
    if (error) { console.error('accessControlService.getAccessLogs:', error); return []; }
    return (data || []).map(l => ({
      ...l,
      action: [l.status, l.access_type].filter(Boolean).join(' · ') || 'Access event',
    }));
  },

  /**
   * Real summary for the three Access Control stat cards, derived from the
   * user's `access_credentials` and `access_logs`:
   *   - currentLevel: access_level of the user's active credentials (null -> '--')
   *   - mfaEnabled: whether the user holds an active credential_type = 'MFA'
   *   - failedAttempts: access_logs with status 'Denied' in the last 7 days
   */
  async getAccessSummary(userId, orgId) {
    const empty = { currentLevel: null, mfaEnabled: false, failedAttempts: 0 };
    if (!userId) return empty;
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [credentials, denied] = await Promise.all([
        supabase
          .from('access_credentials')
          .select('credential_type, access_level, status')
          .eq('user_id', userId)
          .eq('status', 'Active'),
        supabase
          .from('access_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'Denied')
          .gte('access_time', sevenDaysAgo),
      ]);

      const activeCreds = credentials.data || [];
      // Most relevant level: first active credential that carries an access_level.
      const currentLevel = activeCreds.find(c => c.access_level)?.access_level || null;
      const mfaEnabled = activeCreds.some(c => c.credential_type === 'MFA');

      return {
        currentLevel,
        mfaEnabled,
        failedAttempts: denied.count || 0,
      };
    } catch (e) {
      console.error('accessControlService.getAccessSummary:', e);
      return empty;
    }
  },

  /**
   * A user's access credentials from `public.access_credentials`, mapped to the
   * shape the Access Control card expects ({ id, type, expiry, status }).
   * Returns [] when the user has none (the UI shows "No credentials found.").
   */
  async getCredentials(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('access_credentials')
      .select('id, credential_type, expiry_date, status')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });
    if (error) { console.error('accessControlService.getCredentials:', error); return []; }
    return (data || []).map(c => ({
      id: c.id,
      type: c.credential_type,
      expiry: c.expiry_date,
      status: c.status,
    }));
  },
};
