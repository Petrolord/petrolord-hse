// @vitest-environment jsdom
// Batch 1A theme test: My Reports in the signed-in layout, and the reporting
// dialogs that open on every module (Quick Report, the Report Wizard and its
// layout dialog, the Upgrade modal) inside the design-system scope, in light
// and dark (docs/scope/DesignSystem-Rollout.md sections 3.3 and 8.2).
//
// The walk-throughs live in reportingFixtures.jsx. Only the data layer is
// stubbed.
import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses, themeScopes,
} from '@/design/testing/themeAssertions';
import {
  installReportingShims, walkQuickReport, walkQuickReportError, walkReportWizard, walkUpgradeModal,
  flush, qr, ui, toasts, ANALYSIS, REPORTS, orgData,
} from './reportingFixtures';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('./reportingFixtures')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('./reportingFixtures')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/ui/use-toast', async () => (await import('./reportingFixtures')).useToastModule);
vi.mock('@/services/quickReportService', async () => (await import('./reportingFixtures')).quickReportServiceModule);
vi.mock('@/hooks/useOrganizationData', async () => (await import('./reportingFixtures')).orgDataModule);
vi.mock('@/services/requestThrottleService', async () => (await import('./reportingFixtures')).throttleModule);
vi.mock('@/services/aiAnalysisService', async () => (await import('./reportingFixtures')).aiAnalysisModule);
vi.mock('@/services/hseService', async () => (await import('./reportingFixtures')).hseServiceModule);
vi.mock('@/services/departmentService', async () => (await import('./reportingFixtures')).departmentServiceModule);
vi.mock('@/services/siteService', async () => (await import('./reportingFixtures')).siteServiceModule);
vi.mock('@/services/locationService', async () => (await import('./reportingFixtures')).locationServiceModule);
vi.mock('@/services/siteSearchService', async () => (await import('./reportingFixtures')).siteSearchModule);
vi.mock('@/services/templateService', async () => (await import('./reportingFixtures')).templateServiceModule);
vi.mock('@/services/notificationService', async () => (await import('./reportingFixtures')).notificationServiceModule);
vi.mock('@/lib/offlineManager', async () => (await import('./reportingFixtures')).offlineModule);
vi.mock('react-leaflet', async () => (await import('./reportingFixtures')).reactLeafletModule);

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { default: ReportWizard } = await import('@/components/hse/ReportWizard');
const { UpgradeModal } = await import('@/components/layout/UpgradeModal');
const { ThemedApp } = await import('@/design/ThemeProvider');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const MY_REPORTS = { id: 'my-reports', label: 'My Reports' };
const noop = () => {};

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

/** A themed scope around a dialog, as the layout gives it on a migrated module. */
const renderInScope = (ui_) => render(
  <MemoryRouter>
    <ThemedApp data-testid="hse-theme-scope">{ui_}</ThemedApp>
  </MemoryRouter>,
);

const toDark = () => fireEvent.click(within(getScopeRoot()).getAllByTestId('theme-toggle')[0]);

// Every state of a walk: no legacy colour under any scope, and every
// scope and portal carries the chosen theme (the ink rail is dark in both).
const checkState = (theme) => (name) => {
  const scopes = themeScopes().filter((s) => !s.closest('[data-testid="hse-ink-rail"]'));
  expect({ name, themes: [...new Set(scopes.map((s) => s.getAttribute('data-pl-theme')))] })
    .toEqual({ name, themes: [theme] });
  expect({ name, legacy: legacyChromeClasses() }).toEqual({ name, legacy: [] });
};

describe('batch 1A reporting on the design system', () => {
  beforeAll(() => { installDomShims(); installReportingShims(); });
  beforeEach(() => {
    resetShell({ activeModule: MY_REPORTS });
    ui.wizardOpen = false;
    qr.analyze = async () => ANALYSIS;
    qr.reports = REPORTS;
    orgData.departments = [];
    orgData.sites = [];
    toasts.length = 0;
    try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  });

  describeModuleTheme({
    name: 'My Reports',
    moduleId: 'my-reports',
    renderApp: renderLayout,
    ready: async () => {
      await screen.findByText('Loose handrail on stair B');
      await flush();
    },
  });

  describe('My Reports states', () => {
    it('shows statuses and severities as words on the status roles', async () => {
      renderLayout();
      await screen.findByText('Loose handrail on stair B');
      expect(screen.getByText('in progress').className).toMatch(/bg-pl-warning-bg/);
      expect(screen.getByText('closed').className).toMatch(/bg-pl-sunken/);
      expect(screen.getByText('draft').className).toMatch(/border-dashed/);
      expect(screen.getByText('high').closest('div').className).toMatch(/text-pl-danger-text/);
      expectNoLegacyChrome();
    });

    it('opens the report sheet themed, in light and in dark', async () => {
      renderLayout();
      await screen.findByText('Loose handrail on stair B');
      fireEvent.click(screen.getAllByRole('button', { name: 'View' })[0]);
      await screen.findByText('Activity Timeline');
      await flush();
      const sheet = screen.getByRole('dialog');
      expect(sheet).toHaveAttribute('data-pl-theme', 'light');
      expect(within(sheet).getByText('Please fix today', { exact: false })).toBeInTheDocument();
      expectNoLegacyChrome();
      fireEvent.click(within(sheet).getAllByRole('button', { name: 'Close' })[0]);
      await flush();

      toDark();
      fireEvent.click(screen.getAllByRole('button', { name: 'View' })[1]);
      await screen.findByText('Closure Report');
      expect(screen.getByRole('dialog')).toHaveAttribute('data-pl-theme', 'dark');
      expect(screen.getByText('Seal replaced')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('shows the empty state on roles', async () => {
      qr.reports = [];
      renderLayout();
      await screen.findByText('No reports found.');
      expectNoLegacyChrome();
    });
  });

  describe('the Quick Report flow on a migrated module', () => {
    it('walks capture, the mic test, analysing, preview and success with no legacy colour', async () => {
      renderLayout();
      await screen.findByText('Loose handrail on stair B');
      fireEvent.click(screen.getByRole('button', { name: /Quick Report/ }));
      await walkQuickReport(checkState('light'));
      expect(screen.getByRole('button', { name: /Submit Another/ }).className).toMatch(/bg-pl-accent/);
    }, 30000);

    it('walks the same flow in dark, the failed analysis included', async () => {
      orgData.departments = [{ id: 'dep1', name: 'Operations' }];
      orgData.sites = [{ id: 's1', name: 'North Yard' }];
      renderLayout();
      await screen.findByText('Loose handrail on stair B');
      toDark();
      fireEvent.click(screen.getByRole('button', { name: /Quick Report/ }));
      await walkQuickReport(checkState('dark'));
      cleanup();
      renderLayout();
      await screen.findByText('Loose handrail on stair B');
      fireEvent.click(screen.getByRole('button', { name: /Quick Report/ }));
      await walkQuickReportError(checkState('dark'));
      expect(screen.getByRole('alert')).toHaveTextContent('AI analysis failed');
    }, 30000);
  });

  describe('the Report Wizard in a scope', () => {
    it('opens the layout dialog themed on a migrated module', async () => {
      ui.wizardOpen = true;
      renderLayout();
      await screen.findByText('Create New Report');
      await flush();
      expect(screen.getByRole('dialog')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('walks every step with no legacy colour, the map a light canvas, and a success toast', async () => {
      renderInScope(<ReportWizard initialType="Incident" onSuccess={noop} onCancel={noop} />);
      let mapChecked = false;
      await walkReportWizard((name) => {
        checkState('light')(name);
        if (name === 'step2Map') {
          expect(screen.getByTestId('leaflet-map').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'light');
          mapChecked = true;
        }
      });
      expect(mapChecked).toBe(true);
      const done = toasts.find((t) => /Submitted Successfully/.test(t.title));
      expect(done).toMatchObject({ variant: 'success' });
      expect(done.className).toBeUndefined();
    }, 30000);

    it('walks every step in dark', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderInScope(<ReportWizard initialType="Incident" onSuccess={noop} onCancel={noop} />);
      await walkReportWizard(checkState('dark'));
    }, 30000);
  });

  describe('the Upgrade modal in a scope', () => {
    it('renders on roles with the gold accent offer, in light and dark', async () => {
      renderInScope(<UpgradeModal open onOpenChange={noop} />);
      await walkUpgradeModal(checkState('light'));
      expect(screen.getByRole('button', { name: 'Upgrade Now' }).className).toMatch(/bg-pl-accent/);
      cleanup();
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderInScope(<UpgradeModal open onOpenChange={noop} />);
      await walkUpgradeModal(checkState('dark'));
    });
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaRelative = await import('../../../lib/customSupabaseClient');
    const { supabaseModule } = await import('@/design/testing/shellMocks');
    expect(viaRelative.supabase).toBe(supabaseModule.supabase);
  });
});
