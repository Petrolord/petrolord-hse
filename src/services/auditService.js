import { supabase } from '@/lib/customSupabaseClient';
import { blankIdsToNull } from './registerPayload';

// Safety Audit tables are public.hse_audit_schedule / public.hse_audit_findings
// (migration 20260919150000_hse_public_registers.sql), scoped by `org_id` and
// by RLS. They used to be read through supabase.schema('hse'), which PostgREST
// does not expose on this project (PGRST106), so the schedule list, the
// dashboard tile and "Schedule Audit" all failed in production.
//
// Sites embed through the location_id -> organization_sites FK. Auditors are
// auth users, which PostgREST cannot embed, so their names come from the
// org's organization_members rows (full_name, email) and are attached in the
// shape the schedule table already renders: auditor.raw_user_meta_data.full_name.

/**
 * Attach `auditor` to each audit from the org's members. An auditor who is
 * not (or no longer) a member of the org stays unresolved (UI: 'Unassigned').
 */
export async function attachAuditors(orgId, audits) {
  const rows = audits || [];
  const ids = [...new Set(rows.map(a => a.auditor_id).filter(Boolean))];
  if (ids.length === 0) return rows;
  const { data, error } = await supabase
    .from('organization_members')
    .select('user_id, full_name, email')
    .eq('organization_id', orgId)
    .in('user_id', ids);
  if (error) {
    console.error('auditService.attachAuditors:', error);
    return rows;
  }
  const byId = {};
  (data || []).forEach(m => {
    byId[m.user_id] = { id: m.user_id, email: m.email, raw_user_meta_data: { full_name: m.full_name || m.email } };
  });
  return rows.map(a => ({ ...a, auditor: byId[a.auditor_id] || null }));
}

export const auditService = {
  async getAuditSchedule(orgId, filters = {}) {
    let query = supabase
      .from('hse_audit_schedule')
      .select('*, location:location_id(name)')
      .eq('org_id', orgId);

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.type && filters.type !== 'all') query = query.eq('audit_type', filters.type);

    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) throw error;
    return attachAuditors(orgId, data);
  },

  async createScheduledAudit(audit) {
    const { data, error } = await supabase
      .from('hse_audit_schedule')
      .insert(blankIdsToNull(audit))
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getFindings(orgId, filters = {}) {
    let query = supabase
      .from('hse_audit_findings')
      .select('*, location:location_id(name)')
      .eq('org_id', orgId);

    if (filters.severity && filters.severity !== 'all') query = query.eq('severity', filters.severity);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createFinding(finding) {
    const { data, error } = await supabase
      .from('hse_audit_findings')
      .insert(blankIdsToNull(finding))
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Dashboard Stats ---
  // null (not zeros) when either read fails, so the dashboard tile shows its
  // unavailable state instead of an invented "0 open findings".
  async getDashboardStats(orgId) {
    const [findings, schedule] = await Promise.all([
      supabase.from('hse_audit_findings').select('status').eq('org_id', orgId),
      supabase.from('hse_audit_schedule').select('status').eq('org_id', orgId),
    ]);
    if (findings.error || schedule.error) {
      console.error('Error getting audit stats:', findings.error || schedule.error);
      return null;
    }

    const findingRows = findings.data || [];
    const scheduleRows = schedule.data || [];
    const openFindings = findingRows.filter(f => f.status !== 'Closed' && f.status !== 'Resolved').length;
    const upcomingAudits = scheduleRows.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled').length;

    return { totalFindings: findingRows.length, openFindings, upcomingAudits };
  }
};
