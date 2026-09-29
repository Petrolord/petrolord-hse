// @vitest-environment jsdom
// Batch 4B, owner-approved fix: the Leaderboard called
// gamificationService.getUserStats, which does not exist, so Promise.all
// threw and the page always showed "No data available". It also passed the
// period ('all_time') as getLeaderboard's `limit`. And getLeaderboard's
// select asked for a `ranking` column user_points_summary does not have and
// embedded auth.users, so it failed and returned [] even when called.
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { installDomShims } from '@/design/testing/domShims';

installDomShims();
vi.setConfig({ testTimeout: 20000 });

// ---- a recording Supabase stand-in ---------------------------------------
const db = {
  calls: [],
  tables: {
    user_points_summary: [
      { user_id: 'u2', total_points: 310, current_streak: 0 },
      { user_id: 'u1', total_points: 180, current_streak: 3 },
    ],
    user_profiles: [{ id: 'u2', full_name: 'Ada Obi', avatar_url: null }],
    users: [{ id: 'u1', email: 'lead@example.com', raw_user_meta_data: { full_name: 'Test Lead' } }],
    quick_reports: [
      { quality_score: 80, leaderboard_points: 20, created_at: '2026-09-10T10:00:00Z', status: 'submitted' },
      { quality_score: 60, leaderboard_points: 15, created_at: '2026-09-02T10:00:00Z', status: 'closed' },
      { quality_score: 90, leaderboard_points: 30, created_at: '2026-08-20T10:00:00Z', status: 'closed' },
    ],
    // the dated ledger (migration 20260929120000); the stub filters by gte
    hse_points_events: [
      { user_id: 'u1', points: 17, created_at: '2026-09-28T09:00:00Z' },
      { user_id: 'u1', points: 12, created_at: '2026-09-27T09:00:00Z' },
      { user_id: 'u2', points: 10, created_at: '2026-09-15T09:00:00Z' },
      { user_id: 'u2', points: 17, created_at: '2026-08-15T09:00:00Z' },
    ],
  },
  missing: new Set(),
};
function from(table) {
  const call = { table, select: null, filters: [] };
  db.calls.push(call);
  const q = {
    select: (cols) => { call.select = cols; return q; },
    eq: (c, v) => { call.filters.push(['eq', c, v]); return q; },
    neq: (c, v) => { call.filters.push(['neq', c, v]); return q; },
    in: (c, v) => { call.filters.push(['in', c, v]); return q; },
    gte: (c, v) => { call.filters.push(['gte', c, v]); return q; },
    order: () => q,
    limit: (n) => { call.limit = n; return q; },
    maybeSingle: () => q,
    then: (res, rej) => {
      const bad = /\branking\b|user:user_id/.test(call.select || '');
      const gte = call.filters.find((f) => f[0] === 'gte');
      const rows = (db.tables[table] || []).filter((r) => !gte || r[gte[1]] >= gte[2]);
      const out = db.missing.has(table)
        ? { data: null, error: { code: 'PGRST205', message: `Could not find the table 'public.${table}' in the schema cache` } }
        : bad
          ? { data: null, error: { message: 'column user_points_summary.ranking does not exist' } }
          : { data: rows, error: null };
      return Promise.resolve(out).then(res, rej);
    },
  };
  return q;
}
vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: {
    from: (t) => from(t),
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: () => {},
  },
}));
// Stable objects, as the real context provides (a new object per render
// would re-run the fetch effect forever).
const HSE = { currentOrganization: { id: 'o1', name: 'Test Org' }, currentUser: { id: 'u1', email: 'lead@example.com' } };
vi.mock('@/context/HSEContext', () => ({ useHSE: () => HSE }));

const svc = await import('@/services/gamificationService');
const { default: LeaderboardModule } = await import('@/components/hse/LeaderboardModule');
const { default: LeaderboardTable } = await import('@/components/hse/leaderboard/LeaderboardTable');

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });

afterEach(() => { cleanup(); db.calls = []; db.missing = new Set(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('gamificationService (batch 4B)', () => {
  it('getLeaderboard reads real columns and joins the names itself', async () => {
    const rows = await svc.getLeaderboard('o1', 50);
    const main = db.calls.find((c) => c.table === 'user_points_summary');
    expect(main.select).not.toMatch(/ranking|user:user_id/);
    expect(main.limit).toBe(50);
    expect(rows.map((r) => [r.rank, r.user_id, r.name, r.total_points])).toEqual([
      [1, 'u2', 'Ada Obi', 310],
      [2, 'u1', 'Test Lead', 180],
    ]);
  });

  it('getMyReportStats reads the user\'s own submitted reports', async () => {
    const mine = await svc.getMyReportStats('u1', 'o1', new Date('2026-09-28T12:00:00Z'));
    const call = db.calls.find((c) => c.table === 'quick_reports');
    expect(call.filters).toEqual(expect.arrayContaining([
      ['eq', 'created_by_user_id', 'u1'], ['eq', 'organization_id', 'o1'], ['neq', 'status', 'draft'],
    ]));
    expect(mine).toEqual({ qualityScore: 77, pointsThisMonth: 35, reportsThisMonth: 2 });
  });
});

describe('LeaderboardModule (batch 4B)', () => {
  it('uses only service functions that exist and shows the ranking', async () => {
    const spy = vi.spyOn(svc.gamificationService, 'getLeaderboard');
    render(<LeaderboardModule />);
    expect(await screen.findByText('Ada Obi')).toBeInTheDocument();
    expect(screen.getByText('Test Lead')).toBeInTheDocument();
    expect(screen.queryByText('No data available for this period.')).toBeNull();
    // the limit is a number, never the period
    expect(spy).toHaveBeenCalledWith('o1', expect.any(Number));
    expect(spy.mock.calls.every(([, limit]) => typeof limit === 'number')).toBe(true);
    // tiles: rank from the ranking, quality and month from the user's own reports
    expect(screen.getByText('Current Rank').parentElement.querySelector('h3')).toHaveTextContent('#2');
    expect(screen.getByText('Quality Score').parentElement.querySelector('h3')).toHaveTextContent(/^\d+%$/);
  });

  it('ranks This Month and This Week from the dated points ledger', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'));
    render(<LeaderboardModule />);
    await screen.findByText('Ada Obi');
    const month = screen.getByRole('tab', { name: /This Month/ });
    fireEvent.mouseDown(month);
    fireEvent.click(month);
    await flush();
    const ledger = db.calls.filter((c) => c.table === 'hse_points_events');
    expect(ledger.length).toBeGreaterThan(0);
    expect(ledger[0].filters).toEqual(expect.arrayContaining([['eq', 'organization_id', 'o1']]));
    const table = screen.getByRole('table');
    // September: Test Lead 29 (two reports), Ada Obi 10; August's 17 is out
    const body = table.querySelectorAll('tbody tr');
    expect(body[0]).toHaveTextContent('Test Lead');
    expect(body[0]).toHaveTextContent('29');
    expect(body[1]).toHaveTextContent('Ada Obi');
    expect(body[1]).toHaveTextContent('10');
    expect(screen.queryByRole('status')).toBeNull();

    const week = screen.getByRole('tab', { name: /This Week/ });
    fireEvent.mouseDown(week);
    fireEvent.click(week);
    await flush();
    // the week from Monday 28 September (local): Test Lead's 17 only
    const rows = screen.getByRole('table').querySelectorAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Test Lead');
    expect(rows[0]).toHaveTextContent('17');
  });

  it('says the history is not switched on when the ledger table is missing', async () => {
    db.missing.add('hse_points_events');
    render(<LeaderboardModule />);
    await screen.findByText('Ada Obi');
    const tab = screen.getByRole('tab', { name: /This Month/ });
    fireEvent.mouseDown(tab);
    fireEvent.click(tab);
    await flush();
    expect(screen.getByRole('status')).toHaveTextContent('points history is switched on');
    expect(screen.queryByText('Ada Obi')).toBeNull();
  });

  it('opens no realtime channel on leaderboard_scores, which nothing writes', async () => {
    const { supabase } = await import('@/lib/customSupabaseClient');
    const spy = vi.spyOn(supabase, 'channel');
    render(<LeaderboardModule />);
    await screen.findByText('Ada Obi');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('gamificationService.getPeriodLeaderboard', () => {
  it('sums the ledger per person from the period start and ranks it', async () => {
    const res = await svc.getPeriodLeaderboard('o1', 'this_month', new Date(2026, 8, 29, 12));
    const call = db.calls.find((c) => c.table === 'hse_points_events');
    expect(call.filters).toEqual(expect.arrayContaining([
      ['eq', 'organization_id', 'o1'], ['gte', 'created_at', new Date(2026, 8, 1).toISOString()],
    ]));
    expect(res.available).toBe(true);
    expect(res.rows.map((r) => [r.rank, r.user_id, r.name, r.period_points, r.reports])).toEqual([
      [1, 'u1', 'Test Lead', 29, 2],
      [2, 'u2', 'Ada Obi', 10, 1],
    ]);
  });

  it('reports available false when the ledger table does not exist yet', async () => {
    db.missing.add('hse_points_events');
    expect(await svc.getPeriodLeaderboard('o1', 'this_week')).toEqual({ available: false, rows: [] });
  });

  it('starts the week on Monday', () => {
    expect(svc.periodStart('this_week', new Date(2026, 8, 27, 15))).toEqual(new Date(2026, 8, 21));
    expect(svc.periodStart('this_week', new Date(2026, 8, 28, 1))).toEqual(new Date(2026, 8, 28));
  });
});

describe('no client-side points writes', () => {
  it('quickReportService and ReportWizard call no addPoints or updateStreak', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    for (const f of ['src/services/quickReportService.js', 'src/components/hse/ReportWizard.jsx']) {
      const src = fs.readFileSync(path.resolve(process.cwd(), f), 'utf8');
      expect(src, f).not.toMatch(/addPoints|updateStreak/);
    }
  });
});

describe('LeaderboardTable quality words (kept from the 2C theme test)', () => {
  it('pairs each quality score with its word and status colour', () => {
    render(<LeaderboardTable currentUserId="u1" data={[
      { user_id: 'a', rank: 1, quality_score: 92, total_points: 1, user: {} },
      { user_id: 'b', rank: 2, quality_score: 71, total_points: 1, user: {} },
      { user_id: 'c', rank: 3, quality_score: 40, total_points: 1, user: {} },
    ]} />);
    expect(screen.getByText('good').closest('div').className).toContain('bg-pl-success-bg');
    expect(screen.getByText('fair').closest('div').className).toContain('bg-pl-warning-bg');
    expect(screen.getByText('low').closest('div').className).toContain('bg-pl-danger-bg');
  });
});
