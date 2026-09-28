// @vitest-environment jsdom
// Batch 2B theme test: Health (module id health) in the signed-in layout
// (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the dashboard KPI tiles and white chart panels, the placeholder
// tabs, and every Fire Safety section (dashboard gauge with its band word,
// risk register with band words, equipment, incidents and compliance status
// words), in light and in dark. Only the data layer is stubbed; no request
// leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, configure } from '@testing-library/react';
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

vi.mock('@/services/healthService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    healthService: {
      ...actual.healthService,
      getHealthStats: async () => ({ totalMonitored: 48, recordsThisMonth: 6, exposureIncidents: 1, vaccinationRate: null }),
      getHealthCharts: async () => ({
        statusDistribution: [{ name: 'Fit', value: 40 }, { name: 'Restricted', value: 6 }],
        exposureTrend: [{ month: 'Aug', exposures: 1 }, { month: 'Sep', exposures: 2 }],
      }),
    },
  };
});
vi.mock('@/services/fireSafetyService', () => ({
  fireSafetyService: {
    getDashboardStats: async () => ({ riskScore: 45, complianceScore: 80, maintenanceScore: null, drillsCount: 2, incidentsCount: 1 }),
    getEquipment: async () => [
      { id: 'e1', equipment_type: 'CO2 extinguisher', location: 'Control room', serial_number: null, status: 'Needs Service', next_inspection_date: '2026-10-01' },
      { id: 'e2', equipment_type: 'Deluge valve', location: 'Tank farm', serial_number: 'DV-22', status: 'Operational', next_inspection_date: '2026-12-01' },
    ],
    getIncidents: async () => [{ id: 'f1', fire_type: 'Electrical', location: 'Substation', incident_date: '2026-09-01', status: 'Open' }],
    getRisks: async () => [
      { id: 'r1', hazard_id: 'FR-01', description: 'Hot work near fuel store', risk_score: 16, likelihood: 4, consequence: 4, location: 'Fuel store', mitigation_measures: 'Permit and fire watch' },
      { id: 'r2', hazard_id: 'FR-02', description: 'Overloaded sockets', risk_score: 6, likelihood: 2, consequence: 3 },
    ],
    getCompliance: async () => [
      { id: 'k1', checklist_item: 'Extinguishers inspected monthly', standard_ref: 'NFPA 10', last_checked_date: '2026-09-01', is_compliant: true },
      { id: 'k2', checklist_item: 'Fire doors unobstructed', is_compliant: false, remarks: 'Door 4 blocked' },
    ],
  },
}));

// The section walks mount the whole layout several times; give them room on
// a loaded runner.
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
  await screen.findByText('48');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};

describe('Health', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'health', label: 'Health' } }));

  describeModuleTheme({ name: 'Health', moduleId: 'health', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the KPI tiles and the white chart panels', async () => {
      renderLayout();
      await ready();
      expect(screen.getByText('n/a')).toBeInTheDocument();
      expect(screen.getByText('Health Status Distribution').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getByText('Exposure Levels Trend').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expectNoLegacyChrome();
    });

    it('keeps the placeholder tabs on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/Health Incidents/);
      await screen.findByText(/Not yet integrated/);
      expectNoLegacyChrome();
    });

    it('walks every Fire Safety section with status words', async () => {
      renderLayout();
      await ready();
      await clickTab(/Fire Safety/);
      await screen.findByText('Fire Risk Score');
      expect(screen.getByText('High risk').className).toContain('text-pl-danger-text');
      expect(screen.getByText('Needs Service').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();

      await clickTab(/Risk Assessment/);
      await screen.findByText('Fire Risk Assessment Register');
      expect(screen.getByText('High').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Low').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/^Equipment$/);
      await screen.findByText('Fire Equipment Inventory');
      expect(screen.getByText('Operational').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();

      await clickTab(/^Incidents$/);
      await screen.findByText('Fire Incident Register');
      expect(screen.getByText('Open').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();

      await clickTab(/^Compliance$/);
      await screen.findByText('Fire Safety Compliance Checklist');
      expect(screen.getByText('Non-Compliant').className).toContain('bg-pl-danger-bg');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, Fire Safety included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await clickTab(/Fire Safety/);
      await screen.findByText('Fire Risk Score');
      expectNoLegacyChrome();
    });
  });
});
