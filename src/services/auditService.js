import { supabase } from '@/lib/customSupabaseClient';

export const auditService = {
  async getAuditSchedule(orgId, filters = {}) {
    let query = supabase
      .schema('hse')
      .from('audit_schedule')
      .select(`*, auditor:auditor_id(raw_user_meta_data), location:location_id(name)`)
      .eq('org_id', orgId);

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.type && filters.type !== 'all') query = query.eq('audit_type', filters.type);

    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createScheduledAudit(audit) {
    const { data, error } = await supabase
      .schema('hse')
      .from('audit_schedule')
      .insert(audit)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getInternalAudits(orgId, filters = {}) {
    let query = supabase
      .schema('hse')
      .from('internal_audits')
      .select(`*, auditor:auditor_id(raw_user_meta_data), location:location_id(name)`)
      .eq('org_id', orgId);

    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getFindings(orgId, filters = {}) {
    let query = supabase
      .schema('hse')
      .from('audit_findings')
      .select(`*, owner:owner_id(raw_user_meta_data), location:location_id(name)`)
      .eq('org_id', orgId);

    if (filters.severity && filters.severity !== 'all') query = query.eq('severity', filters.severity);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createFinding(finding) {
    const { data, error } = await supabase
      .schema('hse')
      .from('audit_findings')
      .insert(finding)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getExternalReports(orgId) {
    const { data, error } = await supabase
      .schema('hse')
      .from('external_reports')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createExternalReport(report) {
    const { data, error } = await supabase
      .schema('hse')
      .from('external_reports')
      .insert(report)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};