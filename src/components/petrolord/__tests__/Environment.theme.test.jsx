// @vitest-environment jsdom
// Batch 2A theme test: Environment (module id environment) in the signed-in
// layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks every
// tab (dashboard, obligations, studies, monitoring, emissions, waste,
// spills, decommissioning, reporting), the row menu and its delete
// confirmation (portals), and the four create forms, in light and in dark.
// Only the data layer is stubbed; no request leaves the test.
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

const PAST = '2024-01-15T00:00:00Z';
const FUTURE = '2030-06-30T00:00:00Z';

const DATA = {
  stats: { complianceScore: 64, permitsDueSoon: 2, empOverdue: 1, totalFlaring: 12500, totalWaste: 40, totalSpills: 3 },
  permits: [
    { id: 'pe1', permit_number: 'EP-001', type: 'Air Emissions', issuing_authority: 'NUPRC', expiry_date: FUTURE, status: 'Active' },
    { id: 'pe2', permit_number: 'EP-002', type: 'Effluent', issuing_authority: null, expiry_date: null, status: 'Pending' },
    { id: 'pe3', permit_number: 'EP-003', type: 'Waste', issuing_authority: 'NOSDRA', expiry_date: PAST, status: 'Expired' },
  ],
  studies: [
    { id: 'st1', title: 'Baseline EIA', type: 'EIA', cycle_years: 5, last_conducted_date: PAST, next_due_date: PAST, status: 'Current' },
    { id: 'st2', title: 'Noise survey', type: 'Survey', cycle_years: null, last_conducted_date: null, next_due_date: FUTURE, status: 'Due Soon' },
  ],
  emp: [
    { id: 'ea1', action_description: 'Replace oily water separator', mitigation_measure: 'Upgrade filter', responsible_person: 'Ada Obi', due_date: FUTURE, status: 'Open' },
    { id: 'ea2', action_description: 'Plant mangroves', mitigation_measure: 'Offset', responsible_person: 'Kemi Ade', due_date: null, status: 'Closed' },
  ],
  monitoring: [
    { id: 'mo1', parameter: 'Oil & Grease', value: 12, unit: 'mg/l', limit_value: 10, location_point: 'Outfall 1', sample_date: '2026-09-01', status: 'Exceedance' },
    { id: 'mo2', parameter: 'pH', value: 7.1, unit: '', limit_value: null, location_point: null, sample_date: null, status: 'Compliant' },
  ],
  flaring: [
    { id: 'fl1', log_date: '2026-09-10', volume_m3: 4200, reason: 'Compressor trip', duration_hours: 3 },
  ],
  waste: [
    { id: 'wm1', manifest_number: 'WM-2026-00001', waste_type: 'Drill Cuttings', quantity: 12, unit: 'tonnes', classification: 'Hazardous', disposal_facility: null, status: 'In Transit' },
    { id: 'wm2', manifest_number: 'WM-2026-00002', waste_type: 'Scrap', quantity: 3, unit: 'tonnes', classification: 'Recyclable', disposal_facility: 'Onne yard', status: 'Disposed' },
  ],
  spills: [
    { id: 'sp1', spill_id: 'SP-2026-00001', substance: 'Crude Oil', severity: 'Major', incident_date: '2026-08-20', quantity_spilled: 14, unit: 'bbl', status: 'Open' },
    { id: 'sp2', spill_id: 'SP-2026-00002', substance: 'Diesel', severity: 'Minor', incident_date: null, quantity_spilled: 1, unit: 'bbl', status: 'Closed' },
  ],
  facilities: [
    { id: 'fa1', name: 'Flow station A', type: 'Flow station', location: 'Delta', status: 'Active' },
    { id: 'fa2', name: 'Old jetty', type: null, location: null, status: 'Decommissioning' },
    { id: 'fa3', name: 'Pump house', type: 'Utility', location: 'Delta', status: 'Decommissioned' },
  ],
};

vi.mock('@/services/environmentService', () => ({
  environmentService: {
    getDashboardStats: async () => DATA.stats,
    getPermits: async () => DATA.permits,
    getStudies: async () => DATA.studies,
    getEMPActions: async () => DATA.emp,
    getMonitoringResults: async () => DATA.monitoring,
    getFlaringLogs: async () => DATA.flaring,
    getWasteManifests: async () => DATA.waste,
    getSpills: async () => DATA.spills,
    getFacilities: async () => DATA.facilities,
    createPermit: async () => ({}), updatePermit: async () => ({}), deletePermit: async () => ({}),
    logMonitoringData: async () => ({}), updateMonitoringData: async () => ({}), deleteMonitoringData: async () => ({}),
    createWasteManifest: async () => ({}), updateWasteManifest: async () => ({}), deleteWasteManifest: async () => ({}),
    createSpillReport: async () => ({}), updateSpillReport: async () => ({}), deleteSpillReport: async () => ({}),
  },
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
  await screen.findByText('Environment Manager');
  await screen.findByText('Permit Renewal Required');
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

describe('Environment', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'environment', label: 'Environment' } }));

  describeModuleTheme({ name: 'Environment', moduleId: 'environment', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the dashboard alerts on the status variants and the score with its word', async () => {
      renderLayout();
      await ready();
      expect(screen.getByText('Permit Renewal Required').closest('[role="alert"]').className).toContain('bg-pl-warning-bg');
      expect(screen.getByText('Overdue EMP Actions').closest('[role="alert"]').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('At risk').className).toContain('text-pl-danger-text');
      expect(screen.getByRole('button', { name: /Log New Spill/ }).className).toContain('bg-pl-primary');
      expectNoLegacyChrome();
    });

    it('walks every register tab on roles', async () => {
      renderLayout();
      await ready();

      await clickTab(/Obligations & Permits/);
      await screen.findByText('EP-001');
      expect(screen.getByText('Active').className).toContain('bg-pl-success-bg');
      expect(screen.getByText('Pending').className).toContain('bg-pl-warning-bg');
      expect(screen.getByText('Expired').className).toContain('bg-pl-danger-bg');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();

      await clickTab(/Studies & EMP/);
      await screen.findByText('Baseline EIA');
      expect(screen.getByText('Current (overdue)').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Due Soon').className).toContain('bg-pl-warning-bg');
      await screen.findByText('Replace oily water separator');
      expectNoLegacyChrome();

      await clickTab(/^Monitoring$/);
      await screen.findByText('Oil & Grease');
      expect(screen.getByText('Exceedance').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Compliant').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/Emissions & Flaring/);
      await screen.findByText('Compressor trip');
      expectNoLegacyChrome();

      await clickTab(/Waste & Chemicals/);
      await screen.findByText('WM-2026-00001');
      expect(screen.getByText('Hazardous').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Recyclable').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/^Spills$/);
      await screen.findByText('Crude Oil Spill');
      expect(screen.getByText('Major').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();

      await clickTab(/Decommissioning/);
      await screen.findByText('Flow station A');
      expect(within(screen.getByRole('table')).getByText('Decommissioning').className).toContain('bg-pl-warning-bg');
      expectNoLegacyChrome();

      await clickTab(/Reporting/);
      await screen.findByText('Compliance Reporting');
      await screen.findByText('Permit Register');
      expectNoLegacyChrome();
    });

    it('opens the row menu and the delete confirmation in the scope', async () => {
      renderLayout();
      await ready();
      await clickTab(/Obligations & Permits/);
      await screen.findByText('EP-001');
      const menu = await openRowMenu(0);
      expect(menu.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      const del = within(menu).getByText('Delete');
      expect(del.className).toContain('text-pl-danger-text');
      expectNoLegacyChrome();
      fireEvent.click(del);
      const confirm = await screen.findByRole('alertdialog');
      expect(confirm.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(confirm).getByText('Delete permit?')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('opens each create form on roles', async () => {
      renderLayout();
      await ready();

      await clickTab(/Obligations & Permits/);
      fireEvent.click(await screen.findByRole('button', { name: /Add Permit/ }));
      let dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/^Monitoring$/);
      fireEvent.click(await screen.findByRole('button', { name: /New Sample/ }));
      dialog = await screen.findByRole('dialog');
      fireEvent.change(dialog.querySelectorAll('input[type="number"]')[0], { target: { value: '5' } });
      fireEvent.change(dialog.querySelectorAll('input[type="number"]')[1], { target: { value: '10' } });
      expect(within(dialog).getByText(/Status will be recorded as: Compliant/).className).toContain('text-pl-success-text');
      expectNoLegacyChrome();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/Waste & Chemicals/);
      fireEvent.click(await screen.findByRole('button', { name: /New Manifest/ }));
      await screen.findByText('New Waste Manifest');
      expectNoLegacyChrome();
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
      await flush();

      await clickTab(/^Spills$/);
      fireEvent.click(await screen.findByRole('button', { name: /Log New Spill/ }));
      await screen.findByText('Log Spill');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, a form included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await clickTab(/Waste & Chemicals/);
      await screen.findByText('WM-2026-00001');
      fireEvent.click(screen.getByRole('button', { name: /New Manifest/ }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
