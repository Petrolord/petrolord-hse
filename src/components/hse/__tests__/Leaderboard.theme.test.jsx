// @vitest-environment jsdom
// Batch 2C theme test: the Leaderboard (module id leaderboard) in the
// signed-in layout (docs/scope/DesignSystem-Rollout.md sections 3.3 and 8.2).
//
// It walks the stats tiles, the rankings with the current user's row, the
// period tabs and their note, the empty ranking and the loading state, in
// light and in dark. Batch 4B rewired the data; the quality words are
// checked on the table itself in LeaderboardData.test.jsx. Only the data
// layer is stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, within, act, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, themeScopes,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

// gamificationService.getLeaderboard rows (batch 4B: the module reads the
// service's real functions; getUserStats never existed).
const RANKS = [
  { id: 'u2', user_id: 'u2', rank: 1, name: 'Ada Obi', email: null, total_points: 310, points: 310, current_streak: 0 },
  { id: 'u1', user_id: 'u1', rank: 2, name: 'Test Lead', email: 'lead@example.com', total_points: 180, points: 180, current_streak: 3 },
  { id: 'u3', user_id: 'u3', rank: 3, name: 'kemi', email: 'kemi@example.com', total_points: 20, points: 20, current_streak: 0 },
  { id: 'u4', user_id: 'u4', rank: 4, name: 'Unknown', email: null, total_points: 0, points: 0, current_streak: 0 },
];
const MINE = { qualityScore: 71, pointsThisMonth: 35, reportsThisMonth: 3 };
const lb = { ranks: RANKS, hold: false };

// The Leaderboard reads getLeaderboard, getUserScore and getMyReportStats;
// the TopBar reads getUserScore.
vi.mock('@/services/gamificationService', () => {
  const svc = {
    getUserScore: async () => ({ total_points: 180, current_streak: 3, level: 2 }),
    getLeaderboard: async () => (lb.hold ? new Promise(() => {}) : lb.ranks),
    getMyReportStats: async () => MINE,
    // the ledger is not switched on here, so the period tabs show the note
    getPeriodLeaderboard: async () => ({ available: false, rows: [] }),
    getAllBadges: async () => [],
    getUserBadges: async () => [],
  };
  return { gamificationService: svc, default: svc };
});

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const MODULE = { id: 'leaderboard', label: 'Leaderboard' };

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });
const ready = async () => {
  await screen.findByText('Ada Obi');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const toDark = () => fireEvent.click(within(getScopeRoot()).getAllByTestId('theme-toggle')[0]);
const expectTheme = (theme) => {
  const scopes = themeScopes().filter((s) => !s.closest('[data-testid="hse-ink-rail"]'));
  expect([...new Set(scopes.map((s) => s.getAttribute('data-pl-theme')))]).toEqual([theme]);
};

describe('Leaderboard', () => {
  beforeEach(() => {
    resetShell({ activeModule: MODULE });
    lb.ranks = RANKS;
    lb.hold = false;
  });

  describeModuleTheme({ name: 'Leaderboard', moduleId: 'leaderboard', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the rankings, the current user, n/a for missing figures and mono numbers', async () => {
      renderLayout();
      await ready();
      expect(screen.getByText('You').className).toContain('border-pl-primary');
      expect(screen.getByText('Test Lead').closest('tr').className).toContain('bg-pl-primary/10');
      expect(screen.getByText('#4').className).toContain('font-pl-mono');
      // reports and quality per person are not recorded: they read n/a
      const last = screen.getAllByRole('row').at(-1);
      expect(within(last).getAllByText('n/a')).toHaveLength(2);
      expect(screen.getByText('Current Rank').parentElement.querySelector('h3')).toHaveTextContent('#2');
      expect(screen.getByText('Quality Score').parentElement.querySelector('h3')).toHaveTextContent('71%');
      expectNoLegacyChrome();
    });

    it('shows the note while the points history is off, on the kit tabs, and the dark theme', async () => {
      renderLayout();
      await ready();
      await clickTab(/This Week/);
      await screen.findByText(/points history is switched on/);
      expect(screen.getByRole('tab', { name: /This Week/ })).toHaveAttribute('data-state', 'active');
      expectNoLegacyChrome();
      toDark();
      await flush();
      expectTheme('dark');
      expectNoLegacyChrome();
    });

    it('shows the empty ranking', async () => {
      lb.ranks = [];
      renderLayout();
      await screen.findByText('No data available for this period.');
      expectNoLegacyChrome();
    });

    it('shows the loading state on roles', async () => {
      lb.hold = true;
      renderLayout();
      await screen.findByText('Loading ranking...');
      expectNoLegacyChrome();
    });
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaRelative = await import('../../../lib/customSupabaseClient');
    const { supabaseModule } = await import('@/design/testing/shellMocks');
    expect(viaRelative.supabase).toBe(supabaseModule.supabase);
  });
});
