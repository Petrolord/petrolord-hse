// @vitest-environment jsdom
// Batch 2B theme test: Security (module id security) in the signed-in layout
// (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the dashboard (risk gauge with its band word, incidents with
// severity and status words), the incident registry, access control, the
// honest empty tabs, the white analytics chart panels, the supervisor team
// tab and the Log Incident dialog (a portal), in light and in dark. Only the
// data layer is stubbed; no request leaves the test.
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

const INCIDENTS = [
  { id: 'i1', title: 'Fence breach at gate 3', severity: 'Critical', status: 'Open', type: 'Physical Security', incident_code: 'SEC-4101', reference_code: 'SEC-4101', created_at: '2026-09-20T10:00:00Z' },
  { id: 'i2', title: 'Phishing email reported', severity: 'High', status: 'Reported', type: 'Cyber Threat', incident_code: 'SEC-4102', created_at: '2026-09-18T10:00:00Z' },
  { id: 'i3', title: 'Lost badge', severity: 'Low', status: 'Closed', type: null, incident_code: null, created_at: '2026-09-02T10:00:00Z' },
];

vi.mock('@/services/securityRiskService', () => ({ securityRiskService: { calculateRiskScore: async () => 72 } }));
vi.mock('@/services/securityService', () => ({
  securityService: {
    getSecurityStats: async () => ({ incidentsYTD: 3, pendingTrainings: 2, expiringCredentials: 1 }),
    getIncidentAnalytics: async () => ({
      severityDistribution: [{ name: 'Critical', value: 1 }, { name: 'High', value: 1 }, { name: 'Low', value: 1 }],
      incidentTrend: [{ month: 'Aug', incidents: 1 }, { month: 'Sep', incidents: 2 }],
    }),
  },
}));
vi.mock('@/services/incidentService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    incidentService: { ...actual.incidentService, getSecurityIncidents: async () => INCIDENTS, createIncident: async () => ({}) },
  };
});
vi.mock('@/services/accessControlService', () => ({
  accessControlService: {
    getAccessLogs: async () => [{ id: 'l1', action: 'Badge in', resource_accessed: 'Control room', access_time: '2026-09-27T07:30:00Z' }],
    getCredentials: async () => [
      { id: 'c1', type: 'Site badge', expiry: '2027-01-31', status: 'Active' },
      { id: 'c2', type: 'Vehicle pass', expiry: '2026-08-31', status: 'Expired' },
    ],
    getAccessSummary: async () => ({ currentLevel: null, mfaEnabled: true, failedAttempts: 2 }),
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
  await screen.findByText('Fence breach at gate 3');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};

describe('Security', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'security', label: 'Security' } }));

  describeModuleTheme({ name: 'Security', moduleId: 'security', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('names the risk band and puts severity and status in words', async () => {
      renderLayout();
      await ready();
      expect(screen.getByText('HIGH RISK').className).toContain('text-pl-danger-text');
      expect(screen.getByText('Critical').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Open').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Closed').className).toContain('bg-pl-success-bg');
      expectNoLegacyChrome();
    });

    it('lists the incident registry with status words and n/a for gaps', async () => {
      renderLayout();
      await ready();
      await clickTab(/^Incidents$/);
      await screen.findByText('Incident Registry');
      expect(screen.getByText('Reported').className).toContain('bg-pl-warning-bg');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();
    });

    it('shows access control with credential status words', async () => {
      renderLayout();
      await ready();
      await clickTab(/Access Control/);
      await screen.findByText('Site badge');
      expect(screen.getByText('Expired').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Enabled').className).toContain('text-pl-success-text');
      expectNoLegacyChrome();
    });

    it('keeps the honest empty tabs on roles', async () => {
      renderLayout();
      await ready();
      for (const [tab, title] of [[/Awareness/, 'No awareness data yet'], [/Behavioral/, 'No behavioral data yet'], [/Threats/, 'No threat data yet'], [/Compliance/, 'No compliance data yet'], [/^Team$/, 'No member risk profiles yet']]) {
        await clickTab(tab);
        await screen.findByText(title);
        expectNoLegacyChrome();
      }
    });

    it('puts the analytics charts on white chart panels', async () => {
      renderLayout();
      await ready();
      await clickTab(/Analytics/);
      const title = await screen.findByText('Incidents by Severity');
      expect(title.closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getByText('Incident Trends (6 Months)').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expectNoLegacyChrome();
    });

    it('opens the Log Incident dialog in the scope', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getAllByRole('button', { name: /Log Incident/ })[0]);
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(dialog).getByText('Log Security Incident')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the dialog included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      fireEvent.click(screen.getAllByRole('button', { name: /Log Incident/ })[0]);
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
