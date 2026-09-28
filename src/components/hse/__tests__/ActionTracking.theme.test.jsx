// @vitest-environment jsdom
// Batch 1B theme test: Action Tracker (module id actions) in the signed-in
// layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the filter sidebar, stats tiles, quick filters, the list with
// priority badges and an overdue row, the aging view, the details sheet (a
// portal) on every tab and in edit mode, and the empty state, in light and
// in dark. Only the data layer is stubbed; no request leaves the test.
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

const ASSIGNEE = { id: 'u1', email: 'lead@example.com', raw_user_meta_data: { full_name: 'Test Lead' } };
const ACTIONS = [
  {
    id: 'a1', action_code: 'ACT-001', title: 'Replace scaffold toe boards', description: 'Toe boards missing on level 3.',
    category: 'engineering', priority: 'critical', status: 'open', assigned_to: 'u1', assignee: ASSIGNEE,
    due_date: '2026-01-10T00:00:00Z', created_at: '2025-12-01T00:00:00Z', progress_percentage: 10,
    report: { title: 'Dropped spanner on deck', reference_code: 'QR-12' },
    completion_documents: [{ url: 'https://example.com/photo.jpg' }],
    meta_data: { comments: [{ content: 'Boards ordered.', created_at: '2026-09-20T10:00:00Z' }] },
    status_history: [{ status: 'open', changed_at: '2025-12-01T00:00:00Z' }],
  },
  {
    id: 'a2', action_code: 'ACT-002', title: 'Toolbox talk on lifting', description: 'Brief all crews.',
    category: 'training', priority: 'medium', status: 'pending_approval', assigned_to: null,
    due_date: '2099-01-01T00:00:00Z', created_at: '2026-09-25T00:00:00Z', progress_percentage: 100,
    status_history: [{ status: 'open', changed_at: '2026-09-25T00:00:00Z' }, { status: 'pending_approval', changed_at: '2026-09-26T00:00:00Z' }],
  },
  {
    id: 'a3', action_code: 'ACT-003', title: 'Fix stair lighting', description: 'Two lamps out.',
    category: 'maintenance', priority: 'low', status: 'closed', assigned_to: 'u1', assignee: ASSIGNEE,
    approver: { raw_user_meta_data: { full_name: 'Grace Eze' } }, closure_comment: 'Lamps replaced.',
    due_date: '2026-09-01T00:00:00Z', created_at: '2026-08-01T00:00:00Z', progress_percentage: 100,
    status_history: [{ status: 'open', changed_at: '2026-08-01T00:00:00Z' }, { status: 'closed', changed_at: '2026-08-20T00:00:00Z' }],
  },
];

const data = { actions: ACTIONS };
vi.mock('@/services/actionsService', () => ({
  actionsService: {
    getActions: async () => data.actions,
    updateAction: async () => ({}),
    addComment: async (_id, _u, content) => ({ content, created_at: '2026-09-28T10:00:00Z' }),
  },
}));
vi.mock('@/services/organizationUsersService', () => ({
  organizationUsersService: {
    fetchOrganizationUsersEnriched: async () => [{ user_id: 'u1', user: { email: 'lead@example.com', raw_user_meta_data: { full_name: 'Test Lead' } } }],
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
  await screen.findByText('Replace scaffold toe boards');
  await flush();
};
const clickTab = (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
};

describe('Action Tracker', () => {
  beforeEach(() => {
    data.actions = ACTIONS;
    resetShell({ activeModule: { id: 'actions', label: 'Action Tracker' } });
  });

  describeModuleTheme({ name: 'Action Tracker', moduleId: 'actions', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows priority as status badges, the overdue row with its word, and the chips on roles', async () => {
      renderLayout();
      await ready();
      const table = within(screen.getByRole('table'));
      expect(table.getByText('critical').className).toContain('bg-pl-danger-bg');
      expect(table.getByText('medium').className).toContain('bg-pl-warning-bg');
      expect(table.getByText('low').className).toContain('bg-pl-success-bg');
      expect(screen.getByText('Overdue', { selector: '.sr-only' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All Actions/ })).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByRole('button', { name: /High Priority/ }));
      expect(screen.getByRole('button', { name: /High Priority/ })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByText('Fix stair lighting')).toBeNull();
      expectNoLegacyChrome();
    });

    it('draws the aging view on roles', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByRole('button', { name: /Aging/ }));
      await screen.findByText('Open Actions Aging Analysis');
      expect(screen.getByText('0 to 30 Days')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('opens the details sheet on every tab and in edit mode', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByText('Replace scaffold toe boards'));
      const sheet = await screen.findByRole('dialog');
      expect(sheet.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(sheet).getByText('Source Report')).toBeInTheDocument();
      expectNoLegacyChrome();
      fireEvent.click(within(sheet).getByRole('button', { name: /Edit/ }));
      expect(within(sheet).getByText('Assignee')).toBeInTheDocument();
      expectNoLegacyChrome();
      clickTab('Timeline');
      await within(sheet).findByText('Approval Workflow');
      expectNoLegacyChrome();
      clickTab('Docs');
      await within(sheet).findByText('https://example.com/photo.jpg');
      expectNoLegacyChrome();
      clickTab('Chat');
      await within(sheet).findByText('Boards ordered.');
      expectNoLegacyChrome();
    });

    it('shows the approved banner and the approve and reject buttons on roles', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByText('Fix stair lighting'));
      const sheet = await screen.findByRole('dialog');
      clickTab('Timeline');
      await within(sheet).findByText('Approved by Grace Eze');
      expectNoLegacyChrome();
      fireEvent.keyDown(sheet, { key: 'Escape' });
      await flush();
      fireEvent.click(screen.getByText('Toolbox talk on lifting'));
      const second = await screen.findByRole('dialog');
      expect(within(second).getByRole('button', { name: 'Reject' })).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('shows the empty state on roles', async () => {
      data.actions = [];
      renderLayout();
      await screen.findByText('No Actions Assigned');
      await flush();
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the details sheet included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      fireEvent.click(screen.getByText('Replace scaffold toe boards'));
      const sheet = await screen.findByRole('dialog');
      expect(sheet.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });
  });
});
