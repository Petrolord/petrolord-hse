// The Training, Contractor Safety, Safety Audit, Security and Health services
// used to call supabase.schema('hse'), which PostgREST does not expose on
// this project (PGRST106), so every read failed and every create was lost.
// These tests pin the fix: the services talk to the public.hse_* tables
// (migration 20260919150000_hse_public_registers.sql), always scope by org,
// and never reach for a non-public schema again.

import fs from 'node:fs';
import path from 'node:path';

// A fake supabase client: records every call chain and answers each table
// with a configured { data, error, count }.
const calls = [];
let answers = {};
function builder(table) {
  const chain = { table, ops: [] };
  calls.push(chain);
  const proxy = new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') {
        const res = answers[table] || { data: [], error: null, count: 0 };
        return (resolve, reject) => Promise.resolve(res).then(resolve, reject);
      }
      return (...args) => { chain.ops.push([prop, ...args]); return proxy; };
    },
  });
  return proxy;
}
vi.mock('@/lib/customSupabaseClient', () => {
  const client = {
    from: (t) => builder(t),
    schema: (s) => { throw new Error(`schema('${s}') is not exposed by PostgREST`); },
  };
  return { supabase: client, customSupabaseClient: client, default: client };
});
vi.mock('../lib/customSupabaseClient', () => {
  const client = {
    from: (t) => builder(t),
    schema: (s) => { throw new Error(`schema('${s}') is not exposed by PostgREST`); },
  };
  return { supabase: client, customSupabaseClient: client, default: client };
});

const { trainingService } = await import('./trainingService');
const { contractorService } = await import('./contractorService');
const { auditService, attachAuditors } = await import('./auditService');
const { securityService } = await import('./securityService');
const { healthService } = await import('./healthService');
const { blankIdsToNull } = await import('./registerPayload');

const ORG = '10000000-0000-0000-0000-000000000001';
const op = (chain, name) => chain.ops.filter(o => o[0] === name);
const scopedTo = (chain, col) => op(chain, 'eq').some(([, c, v]) => c === col && v === ORG);

beforeEach(() => { calls.length = 0; answers = {}; });

describe('no non-public schema anywhere in src', () => {
  it('no source file calls .schema(...)', () => {
    const hits = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(jsx?|tsx?)$/.test(e.name) && !e.name.endsWith('.test.js')) {
          fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
            const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
            if (/\.schema\(\s*['"`]/.test(code)) hits.push(`${p}:${i + 1}`);
          });
        }
      }
    };
    walk(path.resolve(__dirname, '..'));
    expect(hits).toEqual([]);
  });
});

describe('training service', () => {
  it('reads every register from public.hse_* scoped by org_id', async () => {
    await trainingService.getPrograms(ORG);
    await trainingService.getSchedule(ORG);
    await trainingService.getRecords(ORG);
    await trainingService.getCompetencies(ORG);
    await trainingService.getAssessments(ORG);
    await trainingService.getStats(ORG);
    await trainingService.getCharts(ORG);
    await trainingService.getDashboardStats(ORG);
    const tables = new Set(calls.map(c => c.table));
    expect([...tables].sort()).toEqual([
      'hse_competency_assessments', 'hse_competency_framework', 'hse_competency_records',
      'hse_training_programs', 'hse_training_records', 'hse_training_schedule',
    ]);
    calls.forEach(c => expect(scopedTo(c, 'org_id')).toBe(true));
  });

  it('createProgram inserts into hse_training_programs', async () => {
    answers.hse_training_programs = { data: { id: 'p1' }, error: null };
    const row = await trainingService.createProgram({ org_id: ORG, program_name: 'H2S', created_by: 'u1' });
    expect(row).toEqual({ id: 'p1' });
    expect(calls[0].table).toBe('hse_training_programs');
    expect(op(calls[0], 'insert')[0][1][0]).toMatchObject({ org_id: ORG, program_name: 'H2S', status: 'Active' });
  });

  it('createProgram surfaces a database error instead of pretending success', async () => {
    answers.hse_training_programs = { data: null, error: { code: '42501', message: 'rls' } };
    await expect(trainingService.createProgram({ org_id: ORG, program_name: 'x' })).rejects.toMatchObject({ code: '42501' });
  });

  it('dashboard stats are null, not invented zeros, when a read fails', async () => {
    answers.hse_training_records = { data: null, error: { code: 'PGRST205' } };
    expect(await trainingService.getDashboardStats(ORG)).toBeNull();
  });

  it('dashboard stats count real rows; compliance null without competencies', async () => {
    answers.hse_training_records = { data: [{ status: 'Completed' }, { status: 'Completed' }], error: null };
    answers.hse_competency_records = { data: [], error: null };
    expect(await trainingService.getDashboardStats(ORG)).toEqual({
      trainingRecords: 2, totalCompetencies: 0, validCompetencies: 0, complianceRate: null,
    });
  });
});

describe('contractor service', () => {
  it('reads contractors, inductions and incidents from hse_* by org_id and permits from work_permits by organization_id', async () => {
    answers.work_permits = { data: [{ id: 'w1', status: 'Open', contractor_name: 'Acme', created_at: '2026-09-01' }], error: null };
    const m = await contractorService.getDashboardMetrics(ORG);
    await contractorService.getInductions(ORG);
    const byTable = Object.fromEntries(calls.map(c => [c.table, c]));
    expect(Object.keys(byTable).sort()).toEqual(['hse_contractor_incidents', 'hse_contractors', 'hse_safety_inductions', 'work_permits']);
    expect(scopedTo(byTable.hse_contractors, 'org_id')).toBe(true);
    expect(scopedTo(byTable.hse_contractor_incidents, 'org_id')).toBe(true);
    expect(scopedTo(byTable.hse_safety_inductions, 'org_id')).toBe(true);
    expect(scopedTo(byTable.work_permits, 'organization_id')).toBe(true);
    expect(m.openPermits).toBe(1);
    expect(m.recentActivity[0].message).toBe('Permit for Acme (Open)');
  });

  it('createContractor turns blank site selections into NULL (a blank string is not a uuid)', async () => {
    answers.hse_contractors = { data: { id: 'c1' }, error: null };
    await contractorService.createContractor({ org_id: ORG, company_name: 'Acme', location_id: '', assigned_site_id: '' });
    const row = op(calls[0], 'insert')[0][1];
    expect(row).toMatchObject({ company_name: 'Acme', location_id: null, assigned_site_id: null });
  });

  it('getContractors throws on a database error so the list does not pose as empty', async () => {
    answers.hse_contractors = { data: null, error: { code: 'PGRST205' } };
    await expect(contractorService.getContractors(ORG)).rejects.toMatchObject({ code: 'PGRST205' });
  });
});

describe('audit service', () => {
  it('reads the schedule from hse_audit_schedule and names auditors from the org members', async () => {
    answers.hse_audit_schedule = { data: [{ id: 'a1', auditor_id: 'u1' }, { id: 'a2', auditor_id: 'u9' }], error: null };
    answers.organization_members = { data: [{ user_id: 'u1', full_name: 'Ada Obi', email: 'ada@x' }], error: null };
    const rows = await auditService.getAuditSchedule(ORG);
    expect(calls[0].table).toBe('hse_audit_schedule');
    expect(scopedTo(calls[0], 'org_id')).toBe(true);
    expect(op(calls[0], 'select')[0][1]).toBe('*, location:location_id(name)');
    expect(calls[1].table).toBe('organization_members');
    expect(scopedTo(calls[1], 'organization_id')).toBe(true);
    expect(rows[0].auditor.raw_user_meta_data.full_name).toBe('Ada Obi');
    expect(rows[1].auditor).toBeNull();
  });

  it('attachAuditors makes no request when no audit has an auditor', async () => {
    const rows = await attachAuditors(ORG, [{ id: 'a1', auditor_id: null }]);
    expect(rows).toEqual([{ id: 'a1', auditor_id: null }]);
    expect(calls).toHaveLength(0);
  });

  it('createScheduledAudit sends NULL for an unpicked auditor and location', async () => {
    answers.hse_audit_schedule = { data: { id: 'a1' }, error: null };
    await auditService.createScheduledAudit({ org_id: ORG, audit_id: 'AUD-1', auditor_id: '', location_id: '' });
    expect(op(calls[0], 'insert')[0][1]).toMatchObject({ auditor_id: null, location_id: null, audit_id: 'AUD-1' });
  });

  it('dashboard stats count open findings and upcoming audits; null on error', async () => {
    answers.hse_audit_findings = { data: [{ status: 'Open' }, { status: 'Closed' }], error: null };
    answers.hse_audit_schedule = { data: [{ status: 'Scheduled' }, { status: 'Completed' }], error: null };
    expect(await auditService.getDashboardStats(ORG)).toEqual({ totalFindings: 2, openFindings: 1, upcomingAudits: 1 });
    answers.hse_audit_findings = { data: null, error: { code: 'PGRST205' } };
    expect(await auditService.getDashboardStats(ORG)).toBeNull();
  });
});

describe('security and health services', () => {
  it('security stats read training schedule and competencies from hse_*', async () => {
    answers.hse_training_schedule = { data: null, error: null, count: 3 };
    answers.hse_competency_records = { data: null, error: null, count: 2 };
    answers.security_incidents = { data: null, error: null, count: 5 };
    const s = await securityService.getSecurityStats(ORG);
    expect(s).toEqual({ incidentsYTD: 5, pendingTrainings: 3, expiringCredentials: 2 });
  });

  it('health stats make no health_records request (no source exists) and keep the real vaccination rate', async () => {
    answers.health_metrics = { data: [{ value: 87.4 }], error: null };
    const s = await healthService.getHealthStats(ORG);
    expect(s).toEqual({ totalMonitored: 0, recordsThisMonth: 0, exposureIncidents: 0, vaccinationRate: 87 });
    expect(calls.map(c => c.table)).toEqual(['health_metrics']);
    expect(await healthService.getHealthCharts(ORG)).toEqual({ statusDistribution: [], exposureTrend: [] });
  });
});

describe('blankIdsToNull', () => {
  it('nulls blank *_id strings only', () => {
    expect(blankIdsToNull({ a_id: '', b_id: '  ', c_id: 'x', name: '', n: 0, id: '' }))
      .toEqual({ a_id: null, b_id: null, c_id: 'x', name: '', n: 0, id: null });
  });
});
