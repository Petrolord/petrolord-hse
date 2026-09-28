// @vitest-environment jsdom
// Batch 1B theme test: Supervisor View (module id supervisor-dashboard) in the
// signed-in layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, so the checks cover
// the shell too, then walks the module's states: the reports table with
// status badges, the row actions menu (a portal), the details dialog with the
// safety statistics classification, the 5 Whys investigation and the audit
// trail, and the assign and resolve dialogs, in light and in dark. Only the
// data layer is stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
// Supervisor View reads userData.organization_id from the HSE context.
vi.mock('@/context/HSEContext', async () => {
  const { hseContextModule, shell } = await import('@/design/testing/shellMocks');
  return {
    ...hseContextModule,
    useHSE: () => ({ ...hseContextModule.useHSE(), userData: { id: shell.user.id, organization_id: shell.organization.id } }),
  };
});
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

const REPORTS = [
  {
    id: 'r1aaaaaaaa-0001', organization_id: 'o1', title: 'Dropped spanner on deck', description: 'A spanner fell from the scaffold.',
    reporter_name: 'Ada Obi', severity: 'critical', status: 'open', created_at: '2026-09-20T09:30:00Z', assignee_name: null,
    is_public_submission: true, reporter_phone: '0800 000 000', category: 'Dropped object', location: 'Deck 2',
    investigation_completed_at: '2026-09-22T10:00:00Z', classified_at: null,
  },
  {
    id: 'r2bbbbbbbb-0002', organization_id: 'o1', title: 'Oil on stairway', reporter_name: 'Tunde Bello', severity: 'medium',
    status: 'in_progress', created_at: '2026-09-21T14:05:00Z', assignee_name: 'Test Lead',
  },
  {
    id: 'r3cccccccc-0003', organization_id: 'o1', title: 'Missing guard rail', reporter_name: 'Kemi Ade', severity: 'low',
    status: 'resolved', created_at: '2026-09-22T08:00:00Z', assignee_name: 'Test Lead',
  },
];

const AUDIT = [
  { id: 'e1', action: 'quick_report.created', label: 'Report filed', actor_name: 'Ada Obi', created_at: '2026-09-20T09:30:00Z' },
  { id: 'e2', action: 'quick_report.assigned', label: 'Assigned', actor_name: 'Test Lead', created_at: '2026-09-20T10:00:00Z', details: { assigned_to: 'u2abcdef123' } },
  { id: 'e3', action: 'quick_report.status_changed', label: 'Status changed', actor_name: 'Test Lead', created_at: '2026-09-21T10:00:00Z', details: { from: 'open', to: 'in_progress' } },
  { id: 'e4', action: 'quick_report.resolved', label: 'Resolved', actor_name: 'Test Lead', created_at: '2026-09-22T10:00:00Z' },
];

vi.mock('@/services/quickReportService', () => ({
  quickReportService: {
    getSupervisorReports: async () => ({ data: REPORTS, error: null }),
    getReportAuditLog: async () => ({ data: AUDIT, error: null }),
    getOrgMembers: async () => ({ data: [{ id: 'u2', name: 'Grace Eze', email: 'grace@example.com' }], error: null }),
    assignReport: async () => ({ error: null }),
    updateReportStatus: async () => ({ error: null }),
    saveInvestigation: async () => ({ error: null }),
    saveClassification: async () => ({ data: null, error: null }),
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
const onModule = () => resetShell({ activeModule: { id: 'supervisor-dashboard', label: 'Supervisor View' } });

const openRowMenu = async (rowTitle) => {
  const row = screen.getByText(rowTitle).closest('tr');
  const trigger = within(row).getByRole('button', { name: 'Report actions' });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  await screen.findByRole('menuitem', { name: 'View Details' });
};

describe('Supervisor View', () => {
  beforeEach(onModule);

  describeModuleTheme({
    name: 'Supervisor View',
    moduleId: 'supervisor-dashboard',
    renderApp: renderLayout,
    ready: async () => {
      await screen.findByText('Dropped spanner on deck');
      await flush();
    },
  });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows severity and status as status badges with the word inside', async () => {
      renderLayout();
      await screen.findByText('Dropped spanner on deck');
      const critical = screen.getByText('critical');
      expect(critical.className).toContain('bg-pl-danger-bg');
      expect(screen.getByText('medium').className).toContain('bg-pl-warning-bg');
      expect(screen.getByText('resolved').className).toContain('bg-pl-success-bg');
      expect(screen.getByText('in progress').className).toContain('bg-pl-info-bg');
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('themes the row actions menu (a portal)', async () => {
      renderLayout();
      await screen.findByText('Dropped spanner on deck');
      await openRowMenu('Oil on stairway');
      const menu = screen.getByRole('menu');
      expect(menu.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('opens the details dialog with classification, investigation and audit trail on roles', async () => {
      renderLayout();
      await screen.findByText('Dropped spanner on deck');
      await openRowMenu('Dropped spanner on deck');
      fireEvent.click(screen.getByRole('menuitem', { name: 'View Details' }));
      const dialog = await screen.findByRole('dialog');
      await within(dialog).findByText('Assigned user id:', { exact: false });
      await flush();
      expect(within(dialog).getByText('Safety statistics classification')).toBeInTheDocument();
      expect(within(dialog).getByText('5 Whys Investigation')).toBeInTheDocument();
      expect(within(dialog).getByText('open to in_progress')).toBeInTheDocument();
      expect(within(dialog).getByText('Dropped object')).toBeInTheDocument();
      // the investigation form (completed, so it opens) and the lost time fields
      fireEvent.change(within(dialog).getAllByRole('combobox')[0], { target: { value: 'lost_time' } });
      expect(within(dialog).getByText('Calendar days away from work')).toBeInTheDocument();
      expect(within(dialog).getByText('Root Cause')).toBeInTheDocument();
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('opens the assign and resolve dialogs on roles', async () => {
      renderLayout();
      await screen.findByText('Dropped spanner on deck');
      await openRowMenu('Oil on stairway');
      fireEvent.click(screen.getByRole('menuitem', { name: 'Assign User' }));
      await screen.findByText('Assign Report');
      await flush();
      expectNoLegacyChrome();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await flush();
      await openRowMenu('Oil on stairway');
      fireEvent.click(screen.getByRole('menuitem', { name: 'Mark Resolved' }));
      await screen.findByText('Mark as Resolved?');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the details dialog included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await screen.findByText('Dropped spanner on deck');
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      await openRowMenu('Dropped spanner on deck');
      fireEvent.click(screen.getByRole('menuitem', { name: 'View Details' }));
      const dialog = await screen.findByRole('dialog');
      await flush();
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });

    it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
      const viaRelative = await import('../../../lib/customSupabaseClient');
      const { supabaseModule } = await import('@/design/testing/shellMocks');
      expect(viaRelative.supabase).toBe(supabaseModule.supabase);
    });
  });
});
