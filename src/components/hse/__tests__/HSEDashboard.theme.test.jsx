// @vitest-environment jsdom
// Wave 0 pilot theme test: the HSE dashboard and the AI Analytics module in
// the signed-in layout (docs/scope/DesignSystem-Rollout.md section 5).
//
// It mounts the real PetrolordHSE layout with the real MainContent, so the
// checks cover the whole scope: TopBar with the ThemeToggle, the ink rail,
// the dashboard (setup checklist, gamification tiles, KPI tiles, the
// embedded AI forecast) and the footer. Only the data layer is stubbed.
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell, shell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

const FORECAST = {
  overall_risk_level: 'high',
  confidence: 72,
  summary: 'Two sites show rising near misses around lifting operations.',
  _generated_at: '2026-09-20T10:00:00Z',
  _expires_at: '2026-10-20T10:00:00Z',
  predicted_incidents: [
    {
      category: 'Dropped object', department: 'Operations', timeframe: 'next 30 days', likelihood: 74,
      rationale: 'Near misses doubled in two weeks.', leading_indicators: ['Crane near misses'], preventive_actions: ['Toolbox talk on exclusion zones'],
    },
    { category: 'Slip or trip', likelihood: 35 },
  ],
  leading_indicators: ['Overdue housekeeping actions'],
  recommended_focus: ['Close lifting actions'],
};

vi.mock('@/services/predictiveAnalyticsService', () => ({
  predictiveAnalyticsService: {
    getAggregatedSafetyData: async () => ({
      metrics: { incident_count: 4, nm_incident_ratio: 3.5, action_closure_rate: 80, avg_compliance_score: 91 },
      trends: [{ date: 'Aug', incidents: 2, nearmisses: 5 }, { date: 'Sep', incidents: 2, nearmisses: 9 }],
      risk_factors: [{ type: 'near_miss_spike', severity: 'High', message: 'Near misses up 80 percent' }, { type: 'overdue_actions', severity: 'Medium', message: 'Six actions overdue' }],
    }),
    getLatestForecast: async () => FORECAST,
    getForecastAccuracy: async () => ({ scored: 5, accuracy: 60 }),
    generateForecast: async () => FORECAST,
  },
}));

vi.mock('@/services/orgAdminService', () => ({
  orgAdminService: {
    getSetupStatus: async () => ({ data: { siteCount: 1, departmentCount: 1, memberCount: 1, pendingInviteCount: 0 } }),
    completeOrgSetup: async () => ({ error: null }),
  },
}));

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });

describe('HSE dashboard pilot', () => {
  beforeEach(() => {
    // An org admin on an organisation that has not finished setup, so the
    // launch checklist shows too.
    resetShell({ organization: { id: 'o1', name: 'Test Org', setup_completed: false } });
  });

  describeModuleTheme({
    name: 'HSE Dashboard',
    moduleId: 'dashboard',
    renderApp: renderLayout,
    ready: async () => {
      await screen.findByText('30-Day Safety Outlook');
      await screen.findByText('Get your organization up and running');
      await flush();
    },
  });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the forecast, KPI tiles and setup checklist on roles, with the toggle in the header', async () => {
      renderLayout();
      await screen.findByText('Dropped object');
      await flush();
      const scope = getScopeRoot();
      expect(within(scope).getByTestId('theme-toggle')).toBeInTheDocument();
      expect(within(scope.querySelector('header')).getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByText('High risk')).toBeInTheDocument();
      expect(screen.getByText('Security Incidents')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('keeps the rail a fixed dark ink frame in both themes', async () => {
      renderLayout();
      await screen.findByText('Dropped object');
      const rails = screen.getAllByTestId('hse-ink-rail');
      expect(rails.length).toBeGreaterThan(0);
      for (const rail of rails) expect(rail).toHaveAttribute('data-pl-theme', 'dark');
      fireEvent.click(within(getScopeRoot()).getByTestId('theme-toggle'));
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      for (const rail of screen.getAllByTestId('hse-ink-rail')) expect(rail).toHaveAttribute('data-pl-theme', 'dark');
      // the rail shows no toggle of its own
      for (const rail of rails) expect(within(rail).queryByTestId('theme-toggle')).toBeNull();
    });

    it('draws the Basic Metrics chart on a white chart canvas, with no legacy class around it', async () => {
      renderLayout();
      await screen.findByText('Dropped object');
      const tab = screen.getByRole('tab', { name: /Basic Metrics/ });
      fireEvent.mouseDown(tab);
      fireEvent.click(tab);
      await screen.findByText('Incident and Near Miss Trends');
      const panel = screen.getByText('Incident and Near Miss Trends').closest('[data-canvas]');
      expect(panel).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getByText('Near-Miss Ratio')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('themes the open account menu, notifications and chat, portals included', async () => {
      renderLayout();
      await screen.findByText('Dropped object');
      fireEvent.click(screen.getByTitle('Open Chat Assistant'));
      await screen.findByText('Petrolord Assistant');
      fireEvent.click(screen.getByRole('button', { name: /^Notifications/ }));
      await screen.findByText('No notifications yet');
      const popover = screen.getByText('No notifications yet').closest('[data-pl-theme]');
      expect(popover).toHaveAttribute('data-pl-theme', 'light');
      expect(legacyChromeClasses()).toEqual([]);
    });

    it('opens the AI Analytics module in the same scope', async () => {
      resetShell({ activeModule: { id: 'ai-analytics', label: 'AI Analytics' } });
      renderLayout();
      await screen.findByText('Petrolord AI Safety Predictor');
      await screen.findByText('Dropped object');
      await flush();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'light');
      expect(shell.activeModule.id).toBe('ai-analytics');
      expectNoLegacyChrome();
    });

    it('paints a dark user dark from the first frame of a later visit', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await screen.findByText('Dropped object');
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
