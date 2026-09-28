// @vitest-environment jsdom
// Batch 1A pin: the reporting dialogs OUTSIDE a design-system scope render
// exactly what they rendered on main before the batch touched them.
//
// The Quick Report flow and the Upgrade modal open from the shell (TopBar,
// AppSwitcher) on every module, and the Report Wizard dialog sits in the
// layout, so they are scope-aware (useThemeClass): on a module that has not
// migrated they must not move. reportingLegacyDom.json was captured from
// main 5040cbe before any edit (UPDATE_REPORTING_LEGACY_DOM=1 writes it).
// The walk-throughs live in reportingFixtures.jsx and are shared with
// Reporting.theme.test.jsx.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { installDomShims } from '@/design/testing/domShims';
import { resetShell } from '@/design/testing/shellMocks';
import {
  installReportingShims, stableDom, walkQuickReport, walkQuickReportError, walkReportWizard, walkUpgradeModal,
  flush, qr, ui, toasts, ANALYSIS,
} from './reportingFixtures';

process.env.TZ = 'UTC';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('./reportingFixtures')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('./reportingFixtures')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/MainContent', async () => (await import('@/design/testing/shellMocks')).stubContentModule);
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

const { default: QuickReport } = await import('@/components/hse/QuickReport');
const { default: ReportWizard } = await import('@/components/hse/ReportWizard');
const { UpgradeModal } = await import('@/components/layout/UpgradeModal');
const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const FIXTURE = path.join(__dirname, 'reportingLegacyDom.json');
const UPDATE = process.env.UPDATE_REPORTING_LEGACY_DOM === '1';
const noop = () => {};

async function captureAll() {
  const out = {};
  const snapper = (prefix) => (name) => { out[`${prefix}.${name}`] = stableDom(document.body.innerHTML); };

  resetShell({ activeModule: { id: 'permits', label: 'Work Permits' } });
  qr.analyze = async () => ANALYSIS;
  render(<QuickReport isOpen onClose={noop} />);
  await walkQuickReport(snapper('quickReport'));
  cleanup();

  render(<QuickReport isOpen onClose={noop} />);
  await walkQuickReportError(snapper('quickReport'));
  cleanup();

  toasts.length = 0;
  render(<ReportWizard initialType="Incident" onSuccess={noop} onCancel={noop} />);
  await walkReportWizard(snapper('reportWizard'));
  out['reportWizard.toasts'] = JSON.stringify(toasts);
  cleanup();

  render(<MemoryRouter><UpgradeModal open onOpenChange={noop} /></MemoryRouter>);
  await walkUpgradeModal(snapper('upgradeModal'));
  cleanup();

  // the layout's wizard dialog, open, on a module that has not migrated
  ui.wizardOpen = true;
  render(<MemoryRouter initialEntries={['/dashboard']}><TooltipProvider><PetrolordHSE /></TooltipProvider></MemoryRouter>);
  await flush();
  out['layout.wizardDialog'] = stableDom(document.body.innerHTML);
  cleanup();
  ui.wizardOpen = false;
  return out;
}

describe('reporting dialogs outside a scope (legacy DOM pin)', () => {
  let current;
  beforeAll(async () => {
    installDomShims();
    installReportingShims();
    // a fixed clock (Date only; timers stay real), so the wizard's default
    // incident date is the same on every run
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-20T12:00:00Z'));
    try {
      current = await captureAll();
    } finally {
      vi.useRealTimers();
    }
  }, 60000);

  if (UPDATE) {
    it('writes the fixture', () => {
      fs.writeFileSync(FIXTURE, `${JSON.stringify(current, null, 2)}\n`);
      expect(Object.keys(current).length).toBeGreaterThan(20);
    });
    return;
  }

  const pinned = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

  it('captures every pinned state', () => {
    expect(Object.keys(current).sort()).toEqual(Object.keys(pinned).sort());
  });

  it.each(Object.keys(pinned))('renders %s byte for byte as before', (state) => {
    expect(current[state]).toBe(pinned[state]);
  });

  it('opens no design-system scope', () => {
    for (const html of Object.values(current)) expect(html).not.toMatch(/data-pl-theme|data-pl-root/);
  });
});
