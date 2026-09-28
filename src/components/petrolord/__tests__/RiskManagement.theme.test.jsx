// @vitest-environment jsdom
// Batch 2A theme test: Risk Management (module id risk) in the signed-in
// layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks all ten
// tabs: the dashboard (heat map and a white chart panel), the register with
// its score words, assessment, mitigation (status select, overdue word),
// monitoring (KRI levels), reporting, analytics (three white chart panels),
// appetite, scenarios and culture, plus the row menu, the New Risk form and
// its score word, in light and in dark. Only the data layer is stubbed; no
// request leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
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

const RISKS = [
  {
    id: 'r1', risk_id: 'RISK-2026-0001', title: 'Main generator failure', description: 'Loss of power at the flow station.',
    category: 'Operational', likelihood: 4, impact: 5, risk_score: 20, status: 'Open', owner_id: 'u1',
    owner: { raw_user_meta_data: { full_name: 'Ada Obi' } }, updated_at: '2026-09-20T00:00:00Z', mitigations: [{ count: 1 }],
  },
  {
    id: 'r2', risk_id: 'RISK-2026-0002', title: 'Pipeline corrosion', description: 'Wall thinning on line B.',
    category: 'Health & Safety', likelihood: 3, impact: 4, risk_score: 12, status: 'Mitigated', owner_id: null,
    owner: null, updated_at: '2026-09-18T00:00:00Z', mitigations: [{ count: 0 }],
  },
  {
    id: 'r3', risk_id: 'RISK-2026-0003', title: 'Permit lapse', description: 'Effluent permit renewal late.',
    category: 'Compliance', likelihood: 2, impact: 3, risk_score: 6, status: 'Open', owner_id: 'u1',
    owner: { raw_user_meta_data: { full_name: 'Ada Obi' } }, updated_at: '2026-09-01T00:00:00Z', mitigations: [{ count: 0 }],
  },
  {
    id: 'r4', risk_id: 'RISK-2026-0004', title: 'Minor slip hazard', description: 'Wet deck.',
    category: 'Health & Safety', likelihood: 1, impact: 2, risk_score: 2, status: 'Closed', owner_id: 'u1',
    owner: { raw_user_meta_data: { full_name: 'Ada Obi' } }, updated_at: '2026-08-01T00:00:00Z', mitigations: [{ count: 2 }],
  },
];

const STATS = {
  total: 4, critical: 1, avgScore: 10,
  byCategory: { Operational: 1, 'Health & Safety': 2, Compliance: 1 },
  byStatus: { Open: 2, Mitigated: 1, Closed: 1 },
};

const MITIGATIONS = [
  { id: 'm1', risk_id: 'r1', risk: { risk_id: 'RISK-2026-0001', title: 'Main generator failure' }, description: 'Install a standby generator', strategy: 'Reduce', due_date: '2024-02-01', progress: 40, status: 'In Progress' },
  { id: 'm2', risk_id: 'r2', risk: { risk_id: 'RISK-2026-0002', title: 'Pipeline corrosion' }, description: 'Inhibitor injection', strategy: null, due_date: null, progress: 100, status: 'Completed' },
];

const KRIS = [
  { id: 'k1', name: 'Generator trips per month', risk: { title: 'Main generator failure' }, current_value: 6, unit: 'trips', threshold_warning: 3, threshold_critical: 5, frequency: 'Monthly' },
  { id: 'k2', name: 'Corrosion rate', risk: null, current_value: 0.2, unit: 'mm/y', threshold_warning: 0.3, threshold_critical: 0.5, frequency: null },
  { id: 'k3', name: 'Overdue inspections', risk: null, current_value: null, unit: '', threshold_warning: null, threshold_critical: null },
];

const SCENARIOS = [
  { id: 's1', title: 'Extended pipeline shutdown', description: 'Thirty days offline.', type: 'Operational', probability: 'Likely', impact_financial: 2500000 },
  { id: 's2', title: 'Regulator fine', description: null, type: null, probability: 'Rare', impact_financial: null },
];

vi.mock('@/services/riskService', () => ({
  riskService: {
    getRisks: async () => RISKS,
    getDashboardStats: async () => STATS,
    getAllMitigations: async () => MITIGATIONS,
    getKRIs: async () => KRIS,
    getScenarios: async () => SCENARIOS,
    createRisk: async () => ({}), updateRisk: async () => ({}), deleteRisk: async () => ({}),
    createMitigation: async () => ({}), updateMitigation: async () => ({}), deleteMitigation: async () => ({}),
    createScenario: async () => ({}), updateScenario: async () => ({}), deleteScenario: async () => ({}),
  },
}));
vi.mock('@/services/riskMitigationService', () => ({
  riskMitigationService: { updateStatus: async () => ({}) },
}));
vi.mock('@/services/trainingService', () => ({
  trainingService: { getStats: async () => ({ activePrograms: 3, upcomingTrainings: 2, completedTrainings: 40, qualifiedPersonnel: 18 }) },
}));

// The tab walks mount the whole layout several times; give them room on a
// loaded runner.
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

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });
const ready = async () => {
  await screen.findByText('Enterprise Risk Management');
  await screen.findByText('Top Critical Risks (Requiring Action)');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const openRowMenu = async (index = 0) => {
  const trigger = screen.getAllByRole('button', { name: 'Row actions' })[index];
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  return screen.findByRole('menu');
};

describe('Risk Management', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'risk', label: 'Risk Mgmt' } }));

  describeModuleTheme({ name: 'Risk Management', moduleId: 'risk', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the dashboard heat map with zone words and the chart on a white panel', async () => {
      renderLayout();
      await ready();
      const panel = screen.getByText('Risk Distribution by Category').closest('[data-canvas]');
      expect(panel).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getAllByText('High').length).toBeGreaterThan(0);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Critical').closest('div').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();
    });

    it('walks the register, assessment, mitigation and monitoring tabs on roles', async () => {
      renderLayout();
      await ready();

      await clickTab(/Risk Register/);
      await screen.findByText('Main generator failure');
      expect(screen.getByText('Critical').closest('div').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Medium').closest('div').className).toContain('bg-pl-warning-bg');
      expect(screen.getByText('Low').closest('div').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/Assessment/);
      await screen.findByText('Bow-Tie Analysis');
      expectNoLegacyChrome();

      await clickTab(/Mitigation/);
      await screen.findByText('Install a standby generator');
      const overdue = screen.getByText('Overdue', { selector: 'td span' });
      expect(overdue.closest('td').className).toContain('text-pl-danger-text');
      expectNoLegacyChrome();

      await clickTab(/Monitoring & Control/);
      await screen.findByText('Generator trips per month');
      expect(screen.getByText('No Data').className).toContain('bg-pl-sunken');
      expect(within(screen.getByText('Generator trips per month').closest('.rounded-lg')).getByText('Critical').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();
    });

    it('walks reporting, analytics, appetite, scenarios and culture on roles', async () => {
      renderLayout();
      await ready();

      await clickTab(/^Reporting$/);
      await screen.findByText('Risk Register Detail');
      expectNoLegacyChrome();

      await clickTab(/Analytics/);
      await screen.findByText('Severity Distribution');
      for (const title of ['Severity Distribution', 'Risks by Category', 'Risks by Status']) {
        expect(screen.getByText(title).closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      }
      expectNoLegacyChrome();

      await clickTab(/Appetite & Tolerance/);
      await screen.findByText('Risk Appetite Statement');
      expect(screen.getAllByText(/Over Appetite/)[0].className).toContain('bg-pl-danger-bg');
      expect(screen.getAllByText('Within Appetite')[0].className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/Scenario Planning/);
      await screen.findByText('Extended pipeline shutdown');
      expect(screen.getByText('Likely').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Rare').className).toContain('bg-pl-success-bg');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();

      await clickTab(/Culture & Training/);
      await screen.findByText('Risk Process Maturity');
      expectNoLegacyChrome();
    });

    it('opens the mitigation status select and the row menu in the scope', async () => {
      renderLayout();
      await ready();
      await clickTab(/Mitigation/);
      await screen.findByText('Install a standby generator');
      const select = screen.getAllByRole('combobox', { name: 'Action status' })[0];
      fireEvent.pointerDown(select, { button: 0, ctrlKey: false, pointerType: 'mouse' });
      fireEvent.keyDown(select, { key: 'Enter' });
      const listbox = await screen.findByRole('listbox');
      expect(listbox.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
      fireEvent.keyDown(listbox, { key: 'Escape' });
      await flush();

      const menu = await openRowMenu(0);
      expect(menu.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      fireEvent.click(within(menu).getByText('Delete'));
      const confirm = await screen.findByRole('alertdialog');
      expect(within(confirm).getByText('Delete mitigation action?')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('walks the New Risk, mitigation and scenario forms with the score word', async () => {
      renderLayout();
      await ready();
      await clickTab(/Risk Register/);
      await screen.findByText('Main generator failure');
      fireEvent.click(screen.getByRole('button', { name: /Add Risk/ }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(dialog).getByText('Low').className).toContain('text-pl-success-text');
      expectNoLegacyChrome();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/Mitigation/);
      await screen.findByText('Install a standby generator');
      fireEvent.click(screen.getByRole('button', { name: /Add Action/ }));
      await screen.findByText('Add Mitigation Action');
      expectNoLegacyChrome();
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/Scenario Planning/);
      await screen.findByText('Extended pipeline shutdown');
      fireEvent.click(screen.getByRole('button', { name: /Add Scenario/ }));
      await screen.findByText('Scenario Title *');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the analytics charts and a form included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await clickTab(/Analytics/);
      await screen.findByText('Severity Distribution');
      expectNoLegacyChrome();
      await clickTab(/Risk Register/);
      await screen.findByText('Main generator failure');
      fireEvent.click(screen.getByRole('button', { name: /Add Risk/ }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
