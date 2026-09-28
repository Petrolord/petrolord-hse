// @vitest-environment jsdom
// Batch 1B theme test: Work Permits (module id permits) in the signed-in
// layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the dashboard, all permits, approvals and templates tabs, the
// permit details sheet (a portal) with status and risk words, and the three
// step create form with its validation alert, in light and in dark. Only the
// data layer is stubbed; no request leaves the test.
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

const PERMITS = [
  {
    id: 'p1', permit_number: 'PTW-0101', title: 'Hot work on pipeline B', description: 'Welding a flange on pipeline B.',
    status: 'Active', priority: 'Critical', risk_level: 'High', location: 'Manifold area', department: 'Operations',
    start_date: '2026-09-28T08:00:00Z', end_date: '2026-09-28T17:00:00Z',
    requester: { raw_user_meta_data: { full_name: 'Ada Obi' } }, supervisor: null,
    hazards: ['Hot Work (Welding/Cutting)', 'High Pressure'], ppe_requirements: ['Face Shield'],
    emergency_procedures: 'Fire watch for 30 minutes after work.',
  },
  {
    id: 'p2', permit_number: null, title: 'Tank entry', description: 'Inspect tank 4.', status: 'Draft', priority: 'Low',
    risk_level: 'Medium', location: null, start_date: null, requester: { email: 'kemi@example.com' },
  },
  { id: 'p3', permit_number: 'PTW-0099', title: 'Roof access', status: 'Expired', priority: 'Medium', risk_level: 'Low' },
];

vi.mock('@/services/permitsService', () => ({
  permitsService: {
    getPermits: async () => PERMITS,
    getStats: async () => ({ total: 3, active: 1, pending: 0, expiringSoon: 1 }),
    createPermit: async () => ({}),
  },
}));

// The multi-step walks mount the whole layout several times; give them room
// on a loaded runner.
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
  await screen.findByText('Expiring Soon');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};

describe('Work Permits', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'permits', label: 'Work Permits' } }));

  describeModuleTheme({ name: 'Work Permits', moduleId: 'permits', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('lists permits with status badges and priority words on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/All Permits/);
      await screen.findByText('Hot work on pipeline B');
      expect(screen.getByText('Active').className).toContain('bg-pl-success');
      expect(screen.getByText('Active').className).not.toContain('animate-pulse');
      expect(screen.getByText('Expired').className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('Critical').className).toContain('text-pl-danger-text');
      expectNoLegacyChrome();
    });

    it('shows the approvals and templates placeholders on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/Approvals/);
      await screen.findByText('Module Under Construction');
      expectNoLegacyChrome();
      await clickTab(/Templates/);
      await screen.findByText('Module Under Construction');
      expectNoLegacyChrome();
    });

    it('opens the permit details sheet with the risk word beside its dot', async () => {
      renderLayout();
      await ready();
      await clickTab(/All Permits/);
      await screen.findByText('Hot work on pipeline B');
      fireEvent.click(screen.getAllByRole('button', { name: /^View$/ })[0]);
      const sheet = await screen.findByRole('dialog');
      expect(sheet.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(sheet).getByText('High Risk')).toBeInTheDocument();
      expect(within(sheet).getByText('Fire watch for 30 minutes after work.')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('walks the three step create form and its validation alert on roles', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByRole('button', { name: /New Permit/ }));
      await screen.findByText('Create New Permit');
      expect(screen.getByText('General Information')).toBeInTheDocument();
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Hazards & Controls');
      fireEvent.click(screen.getByLabelText('Confined Space'));
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: /Next/ }));
      await screen.findByText('Schedule & Team');
      expect(screen.getByText('Required for approval workflow.').className).toContain('text-pl-warning-text');
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: /Submit Permit/ }));
      await screen.findByText('Permit Title is required.', { selector: 'div' });
      await flush();
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the details sheet included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      await clickTab(/All Permits/);
      await screen.findByText('Hot work on pipeline B');
      fireEvent.click(screen.getAllByRole('button', { name: /^View$/ })[0]);
      const sheet = await screen.findByRole('dialog');
      expect(sheet.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
