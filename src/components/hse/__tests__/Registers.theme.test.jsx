// @vitest-environment jsdom
// Batch 2D theme test: Analytics, Contractor Safety, Safety Audits and
// Training (module ids analytics, contractor, audit, training) in the
// signed-in layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on each module, runs the standard
// four checks, then walks the tabs, the charts on white panels, the status
// words and the New forms in light and in dark. Only the data layer is
// stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome,
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

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const REPORTS = [
  { id: 'q1', created_at: daysAgo(1), severity: 'critical', category: 'Near miss', location: 'Flow Station 2' },
  { id: 'q2', created_at: daysAgo(3), severity: 'low', category: 'Observation', location: 'Flow Station 2' },
  { id: 'q3', created_at: daysAgo(5), severity: 'medium', category: 'Observation', location: 'Unknown' },
];

vi.mock('@/services/analyticsService', () => ({
  analyticsService: { getRawReportData: async () => ({ data: REPORTS }) },
}));

vi.mock('@/services/contractorService', () => ({
  contractorService: {
    getDashboardMetrics: async () => ({
      totalContractors: 2, activeContractors: 1, totalIncidents: 3, criticalIncidents: 1, openPermits: 4,
      recentActivity: [{ id: 'a1', type: 'Permit', message: 'Hot work permit issued', at: '2026-09-20T10:00:00Z' }],
    }),
    getContractors: async () => [
      { id: 'c1', company_name: 'Delta Rigging Ltd', tier: 'Tier 1', contact_person: 'Ngozi Eze', email: 'ngozi@example.com', status: 'Active', safety_rating: 4 },
      { id: 'c2', company_name: 'Coastal Scaffolds', tier: null, contact_person: 'Femi', email: '', status: 'Suspended', safety_rating: 2 },
    ],
    getInductions: async () => [
      { id: 'i1', date: '2026-09-10', contractor: { company_name: 'Delta Rigging Ltd' }, type: 'Site', status: 'Pending', score: null },
      { id: 'i2', date: null, contractor: null, type: null, status: 'Completed', score: 88 },
    ],
    createContractor: async () => ({}),
  },
}));

vi.mock('@/services/auditService', () => ({
  auditService: {
    getAuditSchedule: async () => [
      { id: 'au1', audit_id: 'AUD-1001', audit_type: 'Internal', scheduled_date: '2026-10-02', status: 'Scheduled', auditor: { raw_user_meta_data: { full_name: 'Ada Obi' } }, location: { name: 'Depot 3' } },
      { id: 'au2', audit_id: 'AUD-1002', audit_type: 'Contractor', scheduled_date: '2026-08-02', status: 'Overdue', auditor: null, location: null },
      { id: 'au3', audit_id: 'AUD-1003', audit_type: 'Site', scheduled_date: '2026-07-02', status: 'Completed', auditor: null, location: { name: 'Jetty' } },
    ],
    createScheduledAudit: async () => ({}),
  },
}));

vi.mock('@/services/trainingService', () => ({
  trainingService: {
    getPrograms: async () => [
      { id: 'p1', program_id: 'TP-1001', program_name: 'Confined Space Entry', category: 'Safety', duration: 8, status: 'Active' },
      { id: 'p2', program_id: 'TP-1002', program_name: 'First Aid Refresher', category: 'Health', duration: 4, status: 'Archived' },
    ],
    getSchedule: async () => [{ id: 's1', scheduled_date: '2026-10-05', program: { program_name: 'Confined Space Entry' }, location: null, trainer: null, status: 'Planned' }],
    getRecords: async () => [
      { id: 'r1', training_date: '2026-09-01', employee: { raw_user_meta_data: { full_name: 'Ada Obi' } }, program: { program_name: 'First Aid Refresher' }, status: 'Passed', score: 92 },
      { id: 'r2', training_date: '2026-09-02', employee: null, program: { program_name: 'First Aid Refresher' }, status: 'Enrolled', score: null },
    ],
    getCompetencies: async () => [],
    getAssessments: async () => [],
    getStats: async () => ({ activePrograms: 3, upcomingTrainings: 2, completedTrainings: 40, qualifiedPersonnel: 18 }),
    getCharts: async () => ({
      complianceTrend: [{ month: 'Aug', completed: 3 }, { month: 'Sep', completed: 5 }],
      competencyGaps: [{ category: 'Safety', score: 72 }, { category: 'Health', score: 64 }, { category: 'Technical', score: 55 }],
    }),
    createProgram: async () => ({}),
  },
}));

// The layout mounts the whole shell; under a loaded full run the first
// paint can take longer than the library's 1 s default.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

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
const on = (id, label) => resetShell({ activeModule: { id, label } });
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const openSelect = async (trigger) => {
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  return screen.findByRole('listbox');
};

const ready = {
  analytics: async () => { await screen.findByText('Advanced Analytics'); await screen.findByText('Flow Station 2'); await flush(); },
  contractor: async () => { await screen.findByText('Contractor Safety Management'); await screen.findByText('Hot work permit issued'); await flush(); },
  audit: async () => { await screen.findByText('Safety Audit Management'); await screen.findByText('AUD-1001'); await flush(); },
  training: async () => { await screen.findByText('Training & Competency'); await screen.findByText('Training Compliance Trend'); await flush(); },
};

describe('Registers (batch 2D)', () => {
  describe('Analytics', () => {
    beforeEach(() => on('analytics', 'Analytics'));
    describeModuleTheme({ name: 'Analytics', moduleId: 'analytics', renderApp: renderLayout, ready: ready.analytics });
  });

  describe('Contractor Safety', () => {
    beforeEach(() => on('contractor', 'Contractor Safety'));
    describeModuleTheme({ name: 'Contractor Safety', moduleId: 'contractor', renderApp: renderLayout, ready: ready.contractor });
  });

  describe('Safety Audits', () => {
    beforeEach(() => on('audit', 'Safety Audits'));
    describeModuleTheme({ name: 'Safety Audits', moduleId: 'audit', renderApp: renderLayout, ready: ready.audit });
  });

  describe('Training', () => {
    beforeEach(() => on('training', 'Training'));
    describeModuleTheme({ name: 'Training', moduleId: 'training', renderApp: renderLayout, ready: ready.training });
  });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('Analytics: both charts sit on white panels, counts in the mono face, the range select in the scope', async () => {
      on('analytics', 'Analytics');
      renderLayout();
      await ready.analytics();
      for (const title of ['Reporting Activity', 'Severity Distribution']) {
        expect(screen.getByText(title).closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      }
      expect(screen.getByText('Total Reports').parentElement.querySelector('h3').className).toContain('font-pl-mono');
      expectNoLegacyChrome();
      const listbox = await openSelect(screen.getByRole('combobox', { name: 'Time range' }));
      expect(listbox.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('Contractor Safety: walks every tab on roles, with the status word on the register', async () => {
      on('contractor', 'Contractor Safety');
      renderLayout();
      await ready.contractor();
      expectNoLegacyChrome();

      await clickTab(/Contractors/);
      await screen.findByText('Delta Rigging Ltd');
      expect(screen.getByText('Active').className).toContain('bg-pl-success-bg');
      expect(screen.getByText('4 of 5')).toBeInTheDocument();
      expectNoLegacyChrome();

      await clickTab(/Inductions/);
      await screen.findByText('1 of 2 induction records pending.');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expect(screen.queryByText('--')).toBeNull();
      expectNoLegacyChrome();

      for (const [tab, heading] of [
        [/Briefings/, 'Daily Safety Briefings'], [/Permits/, 'Work Permits'], [/Incidents/, 'Incident & Near Miss Reporting'],
        [/Training/, 'Training & Competency Matrix'], [/Compliance/, 'Performance & Compliance'],
      ]) {
        await clickTab(tab);
        await screen.findByRole('heading', { name: heading });
        expectNoLegacyChrome();
      }
    });

    it('Contractor Safety: the Add Contractor form opens in the scope', async () => {
      on('contractor', 'Contractor Safety');
      renderLayout();
      await ready.contractor();
      await clickTab(/Contractors/);
      await screen.findByText('Delta Rigging Ltd');
      fireEvent.click(screen.getByRole('button', { name: /Add Contractor/ }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Add New Contractor')).toBeInTheDocument();
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('Safety Audits: status words on Badge status variants, other tabs and the schedule form on roles', async () => {
      on('audit', 'Safety Audits');
      renderLayout();
      await ready.audit();
      expect(screen.getByText('Scheduled', { selector: 'td div' }).className).toContain('bg-pl-info-bg');
      expect(screen.getByText('Overdue', { selector: 'td div' }).className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Completed', { selector: 'td div' }).className).toContain('bg-pl-success-bg');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();

      const listbox = await openSelect(screen.getAllByRole('combobox')[0]);
      expect(listbox.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
      fireEvent.keyDown(listbox, { key: 'Escape' });
      await flush();

      await clickTab(/Findings/);
      await screen.findByText(/coming soon/);
      expectNoLegacyChrome();

      fireEvent.click(screen.getByRole('button', { name: /Schedule Audit/ }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Schedule New Audit')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('Training: charts on white panels, every tab and the New Program form on roles', async () => {
      on('training', 'Training');
      renderLayout();
      await ready.training();
      for (const title of ['Training Compliance Trend', 'Competency Gaps']) {
        expect(screen.getByText(title).closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      }
      expectNoLegacyChrome();

      await clickTab(/Programs/);
      await screen.findByText('Confined Space Entry');
      expect(screen.getByText('Active').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: /New Program/ }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Create Training Program')).toBeInTheDocument();
      expectNoLegacyChrome();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/Records/);
      await screen.findByText('Ada Obi');
      expect(screen.getByText('n/a')).toBeInTheDocument();
      expectNoLegacyChrome();

      for (const [tab, text] of [[/Schedule/, 'Planned'], [/Competency/, 'No competency framework defined.'], [/Assessments/, 'No assessments recorded.']]) {
        await clickTab(tab);
        await screen.findByText(text);
        expectNoLegacyChrome();
      }
    });

    it('stays clean in dark on all four modules', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      for (const [id, label] of [['analytics', 'Analytics'], ['contractor', 'Contractor Safety'], ['audit', 'Safety Audits'], ['training', 'Training']]) {
        on(id, label);
        const { unmount } = renderLayout();
        await ready[id]();
        expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
        expectNoLegacyChrome();
        unmount();
      }
    });
  });
});
