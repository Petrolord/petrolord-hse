// @vitest-environment jsdom
// Batch 2B theme test: Safety Statistics (module id safety-statistics) in the
// signed-in layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the rates tab with its coverage warnings, rate cards and monthly
// table, the trends tab with the white chart panels, the compare tab, the
// exposure hours register and its add dialog (a portal), the schema-missing
// notice, in light and in dark. Only the data layer is stubbed; no request
// leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome,
} from '@/design/testing/themeAssertions';
import { addMonths } from '@/lib/safetyStats/aggregate';
import { currentMonthKey } from '@/components/hse/safety-stats/common';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

// Twelve months ending this month: eleven with hours, one without, a few
// classified reports and one unclassified, so every warning line shows.
const now = currentMonthKey();
const months = Array.from({ length: 12 }, (_, i) => addMonths(now, i - 11));
const noHoursMonth = months[3];
const EXPOSURE = months.filter((m) => m !== noHoursMonth).map((m, i) => ({
  id: `h${i}`, site_id: i % 2 ? 's1' : null, period_start: `${m}-01`, period_end: `${m}-28`,
  hours: 42000, headcount: i % 3 ? 210 : null, workforce: 'combined', source: i % 2 ? 'payroll export' : null, notes: null,
}));
const report = (id, month, fields) => ({
  id, status: 'submitted', created_at: `${month}-15T12:00:00Z`, occurred_on: `${month}-14`, site_id: 's1', title: id, ...fields,
});
const REPORTS = [
  report('r1', months[1], { injury_classification: 'medical_treatment', workforce: 'employee', classified_at: '2026-01-01' }),
  report('r2', months[5], { injury_classification: 'lost_time', days_away: 6, workforce: 'contractor', classified_at: '2026-01-01' }),
  report('r3', months[8], { injury_classification: 'restricted', days_restricted: 3, workforce: 'employee', classified_at: '2026-01-01' }),
  report('r4', months[10], { injury_classification: 'lost_time', workforce: 'employee', classified_at: '2026-01-01' }),
  report('r5', noHoursMonth, { injury_classification: 'medical_treatment', workforce: 'employee', classified_at: '2026-01-01' }),
  report('r6', months[11], {}),
];
const SITES = [{ id: 's1', name: 'Terminal A', is_active: true }, { id: 's2', name: 'Old yard', is_active: false }];

const data = { reports: REPORTS, exposure: EXPOSURE, missing: false };
vi.mock('@/services/safetyStatsService', () => ({
  isSchemaMissing: (e) => !!e && e.code === '42P01',
  describeSaveError: (e) => e.message,
  safetyStatsService: {
    getReports: async () => (data.missing ? { data: [], error: { code: '42P01', message: 'missing' } } : { data: data.reports, error: null }),
    getExposureHours: async () => (data.missing ? { data: [], error: { code: '42P01', message: 'missing' } } : { data: data.exposure, error: null }),
    getSites: async () => ({ data: SITES, error: null }),
    saveExposureHours: async () => ({ data: {}, error: null }),
    deleteExposureHours: async () => ({ error: null }),
  },
}));

// The multi-tab walks mount the whole layout several times; give them room
// on a loaded runner.
vi.setConfig({ testTimeout: 30000 });
configure({ asyncUtilTimeout: 8000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });
const ready = async () => {
  await screen.findByText('Month by month');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};

describe('Safety Statistics', () => {
  beforeEach(() => {
    resetShell({ activeModule: { id: 'safety-statistics', label: 'Safety Statistics' } });
    data.missing = false;
  });

  describeModuleTheme({ name: 'Safety Statistics', moduleId: 'safety-statistics', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the rates with warnings as words on the warning role', async () => {
      renderLayout();
      await ready();
      const notice = screen.getByText(/1 report is not classified yet/);
      expect(notice.closest('div.rounded-lg').className).toContain('bg-pl-warning-bg');
      expect(screen.getByText(/months have no hours/)).toBeInTheDocument();
      expect(screen.getByText('TRIR')).toBeInTheDocument();
      expect(screen.getAllByText('No hours').length).toBeGreaterThan(0);
      expectNoLegacyChrome();
    });

    it('puts the trend charts on white chart panels', async () => {
      renderLayout();
      await ready();
      await clickTab(/Trends/);
      const title = await screen.findByText(/Rolling 12-month TRIR/);
      expect(title.closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getByText(/u-chart, monthly TRIR/).closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expectNoLegacyChrome();
    });

    it('compares two selections on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/Compare/);
      await screen.findByText('Selection A');
      expect(screen.getByText('Selection B')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('lists exposure hours and opens the add dialog in the scope', async () => {
      renderLayout();
      await ready();
      await clickTab(/Exposure hours/);
      await screen.findByRole('button', { name: /Add hours/ });
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: /Add hours/ }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(dialog).getByText('Add exposure hours')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('opens the delete confirmation on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/Exposure hours/);
      fireEvent.click((await screen.findAllByRole('button', { name: 'Delete' }))[0]);
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Delete these hours?')).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Delete' }).className).toContain('bg-pl-danger');
      expectNoLegacyChrome();
    });

    it('says plainly when the schema is missing', async () => {
      data.missing = true;
      renderLayout();
      await screen.findByText('Safety statistics are not switched on yet');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the trend panels included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await clickTab(/Trends/);
      await screen.findByText(/Rolling 12-month TRIR/);
      expectNoLegacyChrome();
    });
  });
});
