// HS2 Occupational Hygiene: reads and writes for the three hygiene tables.
// Every query is scoped by organization, writes included (never by id
// alone). RLS enforces the same server side, and the database stamps
// created_by / updated_by itself.

import { supabase } from '@/lib/customSupabaseClient';

// PostgREST / Postgres codes for "that table does not exist yet": the HS2
// migration is held until the owner applies it, and the module says so
// plainly instead of failing (the calculators still work without saving).
const MISSING_CODES = new Set(['42P01', '42703', 'PGRST205', 'PGRST204', 'PGRST200']);
export const isSchemaMissing = (error) => !!error && (MISSING_CODES.has(error.code)
  || /does not exist|could not find the table|schema cache/i.test(error.message || ''));

export const HYGIENE_TABLES = {
  noise: 'hse_noise_samples',
  chemical: 'hse_chemical_samples',
  heat: 'hse_heat_assessments',
};

const DATE_COLUMN = { noise: 'sample_date', chemical: 'sample_date', heat: 'assessment_date' };

const list = async (kind, orgId) => {
  if (!orgId) return { data: [], error: null };
  const { data, error } = await supabase
    .from(HYGIENE_TABLES[kind])
    .select('*')
    .eq('organization_id', orgId)
    .order(DATE_COLUMN[kind], { ascending: false })
    .order('created_at', { ascending: false });
  return { data: data || [], error };
};

const saveOne = async (kind, orgId, id, row) => {
  if (!orgId) return { data: null, error: new Error('No organization selected') };
  const table = HYGIENE_TABLES[kind];
  if (id) {
    const { data, error } = await supabase.from(table).update(row).eq('id', id).eq('organization_id', orgId).select('*').single();
    return { data, error };
  }
  const { data, error } = await supabase.from(table).insert({ ...row, organization_id: orgId }).select('*').single();
  return { data, error };
};

export const hygieneService = {
  listNoise: (orgId) => list('noise', orgId),
  listChemical: (orgId) => list('chemical', orgId),
  listHeat: (orgId) => list('heat', orgId),

  async getSites(orgId) {
    if (!orgId) return { data: [], error: null };
    const { data, error } = await supabase
      .from('organization_sites')
      .select('id, name, is_active')
      .eq('organization_id', orgId)
      .order('name');
    return { data: data || [], error };
  },

  saveNoise: (orgId, id, row) => saveOne('noise', orgId, id, row),
  saveHeat: (orgId, id, row) => saveOne('heat', orgId, id, row),

  /**
   * A chemical sample is one row per agent. Every row carries its id, so the
   * whole sample is ONE upsert statement: it saves completely or not at all.
   * Agents removed while editing are deleted afterwards, by id and org.
   */
  async saveChemicalSample(orgId, rows, removedIds = []) {
    if (!orgId) return { data: null, error: new Error('No organization selected') };
    const { data, error } = await supabase
      .from(HYGIENE_TABLES.chemical)
      .upsert(rows.map((r) => ({ ...r, organization_id: orgId })), { onConflict: 'id' })
      .select('*');
    if (error) return { data: null, error };
    if (removedIds.length) {
      const { error: delError } = await supabase
        .from(HYGIENE_TABLES.chemical)
        .delete()
        .in('id', removedIds)
        .eq('organization_id', orgId);
      if (delError) return { data, error: delError };
    }
    return { data, error: null };
  },

  async remove(kind, orgId, ids) {
    if (!orgId || !ids || !ids.length) return { error: new Error('Missing organization or record') };
    const { error } = await supabase
      .from(HYGIENE_TABLES[kind])
      .delete()
      .in('id', ids)
      .eq('organization_id', orgId);
    return { error };
  },
};

/** A readable message for a refused save. */
export const describeSaveError = (error) => {
  if (!error) return null;
  if (error.code === '42501') return 'Only a supervisor, manager, health officer or admin of this organization can change hygiene records.';
  if (error.code === '23514') return 'The database refused the values (check every period has a number, durations are not negative and a limit has its source).';
  if (error.code === '23503') return 'That site no longer exists.';
  if (isSchemaMissing(error)) return 'Hygiene records are not switched on in this environment yet.';
  return error.message || 'Could not save.';
};
