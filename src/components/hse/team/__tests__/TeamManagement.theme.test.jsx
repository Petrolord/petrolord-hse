// @vitest-environment jsdom
// Batch 1C theme test: Members (Team Management, module id `team`) in the
// signed-in layout: the invite card, the pending invitations, the Brevo
// help dialog and the shared OrganizationMembers card (which /organization
// also renders; see src/pages/__tests__/OrganizationSettings.theme.test.jsx).
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses,
} from '@/design/testing/themeAssertions';

// The shell's Supabase stub, with pending invitations on the invitations
// table and a configurable reply from the invite function.
const fx = {
  invitations: [
    { id: 'i1', email: 'pending.one@example.com', role: 'supervisor', created_at: '2026-09-20T10:00:00Z' },
  ],
  invokeReply: { data: { success: true }, error: null },
};
vi.mock('@/lib/customSupabaseClient', async () => {
  const { supabaseModule } = await import('@/design/testing/shellMocks');
  const base = supabaseModule.supabase;
  const rows = () => {
    const q = { select: () => q, eq: () => q, order: () => q, single: () => q };
    q.then = (res, rej) => Promise.resolve({ data: fx.invitations, error: null }).then(res, rej);
    return q;
  };
  base.from = ((orig) => (table) => (table === 'invitations' ? rows() : orig(table)))(base.from);
  base.functions = { invoke: async () => fx.invokeReply };
  return supabaseModule;
});
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');
const { Toaster } = await import('@/components/ui/toaster');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
      <Toaster />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };

describe('Members (batch 1C)', () => {
  beforeEach(() => resetShell({ activeModule: { id: 'team', label: 'Team Management' } }));

  describeModuleTheme({
    name: 'Members',
    moduleId: 'team',
    renderApp: renderLayout,
    ready: async () => { await screen.findByText('pending.one@example.com'); await flush(); },
  });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => {
      try { window.localStorage.clear(); } catch { /* storage unavailable */ }
      fx.invokeReply = { data: { success: true }, error: null };
    });

    it('shows the invite card, pending invitations and the members card on roles', async () => {
      renderLayout();
      await screen.findByText('pending.one@example.com');
      await flush();
      expect(screen.getByText('Invite New Member')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('supervisor')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('themes the role menu and the members invite form', async () => {
      renderLayout();
      await screen.findByText('pending.one@example.com');
      click(screen.getByRole('combobox', { name: 'Role' }));
      await screen.findByRole('option', { name: 'Supervisor' });
      expect(legacyChromeClasses()).toEqual([]);
      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      click(screen.getByRole('button', { name: /Invite Member/ }));
      await screen.findByPlaceholderText('member@example.com');
      expectNoLegacyChrome();
    });

    it('a sent invite shows a success toast on the family roles, then the Sent badge with its word', async () => {
      renderLayout();
      await screen.findByText('pending.one@example.com');
      click(screen.getByRole('button', { name: /Resend/ }));
      await screen.findByText('Invitation Resent');
      await flush();
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText(/^Wait \d+s$/)).toBeInTheDocument();
      const toast = screen.getByText('Invitation Resent').closest('li');
      expect(toast.className).toContain('bg-pl-success-bg');
      expect(legacyChromeClasses()).toEqual([]);
    });

    it('the Brevo configuration dialog is themed', async () => {
      fx.invokeReply = { data: { error: 'BREVO_API_KEY missing' }, error: null };
      renderLayout();
      await screen.findByText('pending.one@example.com');
      fireEvent.change(screen.getByPlaceholderText('colleague@company.com'), { target: { value: 'new@example.com' } });
      fireEvent.submit(screen.getByPlaceholderText('colleague@company.com').closest('form'));
      await screen.findByText('Brevo Configuration Required');
      await flush();
      expect(screen.getByText('BREVO_SMTP_HOST')).toBeInTheDocument();
      expect(legacyChromeClasses()).toEqual([]);
    });

    it('stays on roles in dark', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await screen.findByText('pending.one@example.com');
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });

    it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
      const viaRelative = await import('../../../../lib/customSupabaseClient');
      const { supabaseModule } = await import('@/design/testing/shellMocks');
      expect(viaRelative.supabase).toBe(supabaseModule.supabase);
      expect(within(document.body).queryByText('pending.one@example.com')).toBeNull();
    });
  });
});
