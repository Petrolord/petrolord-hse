// HS1 Safety Statistics: reads and writes for exposure hours, and the report
// fields the statistics need. Every query is scoped by organization, writes
// included (never by user or id alone). RLS enforces the same server side.

import { supabase } from '@/lib/customSupabaseClient';
import { monthStart, monthEnd } from '@/lib/safetyStats/aggregate';

// PostgREST / Postgres codes for "that table or column does not exist yet":
// the HS1 migration is held until the owner applies it, and the module says
// so plainly instead of failing.
const MISSING_CODES = new Set(['42P01', '42703', 'PGRST205', 'PGRST204', 'PGRST200']);
export const isSchemaMissing = (error) => !!error && (MISSING_CODES.has(error.code)
  || /does not exist|could not find the table|schema cache/i.test(error.message || ''));

const REPORT_FIELDS = [
  'id', 'organization_id', 'site_id', 'status', 'created_at', 'title', 'category', 'severity',
  'occurred_on', 'injury_classification', 'days_away', 'days_restricted',
  'pse_classification', 'workforce', 'classified_at',
].join(', ');

const HOURS_FIELDS = 'id, organization_id, site_id, period_start, period_end, hours, headcount, workforce, source, notes, created_at, updated_at';

export const safetyStatsService = {
  async getReports(orgId) {
    if (!orgId) return { data: [], error: null };
    const { data, error } = await supabase
      .from('quick_reports')
      .select(REPORT_FIELDS)
      .eq('organization_id', orgId);
    return { data: data || [], error };
  },

  async getExposureHours(orgId) {
    if (!orgId) return { data: [], error: null };
    const { data, error } = await supabase
      .from('hse_exposure_hours')
      .select(HOURS_FIELDS)
      .eq('organization_id', orgId)
      .order('period_start', { ascending: false });
    return { data: data || [], error };
  },

  async getSites(orgId) {
    if (!orgId) return { data: [], error: null };
    const { data, error } = await supabase
      .from('organization_sites')
      .select('id, name, is_active')
      .eq('organization_id', orgId)
      .order('name');
    return { data: data || [], error };
  },

  /**
   * Insert or update one month of hours. `month` is 'YYYY-MM'; the row's
   * period is that calendar month (the database checks it).
   */
  async saveExposureHours(orgId, { id, month, siteId, hours, headcount, workforce, source, notes }) {
    if (!orgId) return { data: null, error: new Error('No organization selected') };
    const row = {
      site_id: siteId || null,
      period_start: monthStart(month),
      period_end: monthEnd(month),
      hours,
      headcount: Number.isInteger(headcount) ? headcount : null,
      workforce,
      source: source || null,
      notes: notes || null,
    };
    if (id) {
      const { data, error } = await supabase
        .from('hse_exposure_hours')
        .update(row)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select(HOURS_FIELDS)
        .single();
      return { data, error };
    }
    const { data, error } = await supabase
      .from('hse_exposure_hours')
      .insert({ ...row, organization_id: orgId })
      .select(HOURS_FIELDS)
      .single();
    return { data, error };
  },

  async deleteExposureHours(orgId, id) {
    if (!orgId || !id) return { error: new Error('Missing organization or row') };
    const { error } = await supabase
      .from('hse_exposure_hours')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);
    return { error };
  },
};

/** A readable message for the unique (org, site, month, workforce) clash. */
export const describeSaveError = (error) => {
  if (!error) return null;
  if (error.code === '23505') return 'Hours for this month, site and workforce already exist. Edit that row instead.';
  if (error.code === '23514') return 'The database refused the values: hours must be above zero and the period one calendar month.';
  if (error.code === '42501') return 'Only a supervisor, manager or admin of this organization can change safety statistics data.';
  if (error.code === '23503') return 'That site no longer exists.';
  return error.message || 'Could not save.';
};
