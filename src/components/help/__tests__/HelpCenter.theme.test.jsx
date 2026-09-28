// @vitest-environment jsdom
// Batch 2C theme test: the Help Centre (module id help) in the signed-in
// layout (docs/scope/DesignSystem-Rollout.md sections 3.3 and 8.2).
//
// The Help Centre is code-driven (src/data/helpContent), so the real guides
// and FAQs render here. It walks every tab: Getting Started with the admin
// callout, Module Guides and a guide with its warning and info alert blocks,
// Features and Workflows with the approval words, the FAQs (open, filtered,
// empty), Support with its select menu (a portal) and the ticket toast, and
// the global search (results and none), in light and in dark. Only the data
// layer is stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, within, act, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses, themeScopes,
} from '@/design/testing/themeAssertions';
import { guideList } from '@/data/helpContent/index';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/ui/use-toast', async () => (await import('@/components/hse/__tests__/reportingFixtures')).useToastModule);

const tickets = [];
vi.mock('@/services/helpService', () => ({
  helpService: { createTicket: async (t, orgId) => { tickets.push({ ...t, orgId }); return {}; } },
}));

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');
const { toasts } = await import('@/components/hse/__tests__/reportingFixtures');

const MODULE = { id: 'help', label: 'Help Center' };

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };
const ready = async () => {
  await screen.findByText('Welcome to Petrolord HSE');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const toDark = () => fireEvent.click(within(getScopeRoot()).getAllByTestId('theme-toggle')[0]);
const expectTheme = (theme) => {
  const scopes = themeScopes().filter((s) => !s.closest('[data-testid="hse-ink-rail"]'));
  expect([...new Set(scopes.map((s) => s.getAttribute('data-pl-theme')))]).toEqual([theme]);
};

const checkState = (theme) => (name) => {
  expectTheme(theme);
  expect({ name, legacy: legacyChromeClasses() }).toEqual({ name, legacy: [] });
};

// A guide with both a warning and an info alert block in one section, so the
// reader's status roles are both seen.
const findAlertSection = () => {
  for (const guide of guideList) {
    for (const section of guide.sections || []) {
      const alerts = Array.isArray(section.content) ? section.content.filter((b) => b && b.type === 'alert') : [];
      if (alerts.some((a) => a.variant === 'warning') && alerts.some((a) => a.variant === 'info')) return { guide, section, alerts };
    }
  }
  for (const guide of guideList) {
    for (const section of guide.sections || []) {
      const alerts = Array.isArray(section.content) ? section.content.filter((b) => b && b.type === 'alert') : [];
      if (alerts.length) return { guide, section, alerts };
    }
  }
  return null;
};

// Walks every tab and the search; `check` runs at each state.
async function walkHelp(check) {
  await ready();
  check('start');
  expect(screen.getByText('Setting up a new organization?').closest('div.rounded-xl').className).toContain('bg-pl-info-bg');

  await clickTab(/Module Guides/);
  await screen.findByText('Recommended Reading');
  check('modules');
  const target = findAlertSection();
  expect(target).not.toBeNull();
  fireEvent.click(screen.getByText(target.guide.title, { selector: 'h3' }));
  await screen.findByText('Back to Guides');
  fireEvent.click(screen.getByRole('button', { name: target.section.title }));
  await flush();
  for (const alert of target.alerts) {
    const box = screen.getByText(alert.title).closest('div.rounded-lg');
    expect(box.className).toContain(alert.variant === 'warning' ? 'bg-pl-warning-bg' : alert.variant === 'info' ? 'bg-pl-info-bg' : 'bg-pl-sunken');
  }
  check('guide');
  fireEvent.click(screen.getByRole('button', { name: /Back to Guides/ }));
  await flush();

  await clickTab(/Features & Workflows/);
  await screen.findByText('Approval Processes');
  expect(screen.getByText('Manager Approval').className).toContain('bg-pl-warning-bg');
  expect(screen.getByText('Executive / Board Approval').className).toContain('bg-pl-danger-bg');
  expect(screen.queryByText(/—/)).toBeNull();
  check('workflows');

  await clickTab(/FAQs/);
  await screen.findByText('Frequently Asked Questions');
  click(screen.getByRole('button', { name: 'How do I report a hazard or incident?' }));
  await flush();
  check('faqsOpen');
  fireEvent.change(screen.getByLabelText('Search FAQs'), { target: { value: 'zzzz-nothing' } });
  await screen.findByText('No questions found matching your search.');
  check('faqsEmpty');

  await clickTab(/Support/);
  await screen.findByText('Submit a Support Ticket');
  click(screen.getAllByRole('combobox')[0]);
  await screen.findByRole('option', { name: 'Billing' });
  check('supportMenu');
  click(screen.getByRole('option', { name: 'Billing' }));
  await flush();

  fireEvent.change(screen.getByLabelText('Search guides and FAQs'), { target: { value: 'quick report' } });
  await screen.findByText(/results? for/);
  check('searchResults');
  fireEvent.change(screen.getByLabelText('Search guides and FAQs'), { target: { value: 'zzzz-nothing' } });
  await screen.findByText('We couldn’t find anything matching that.');
  check('searchEmpty');
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  await flush();
}

describe('Help Centre', () => {
  beforeEach(() => {
    resetShell({ activeModule: MODULE });
    toasts.length = 0;
    tickets.length = 0;
  });

  describeModuleTheme({ name: 'Help Centre', moduleId: 'help', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('walks every tab, a guide and the search in light with no legacy colour', async () => {
      renderLayout();
      await walkHelp(checkState('light'));
    });

    it('walks the same states in dark', async () => {
      renderLayout();
      await ready();
      toDark();
      await flush();
      await walkHelp(checkState('dark'));
    });

    it('submits a ticket with a success toast and no painted class', async () => {
      renderLayout();
      await ready();
      await clickTab(/Support/);
      await screen.findByText('Submit a Support Ticket');
      fireEvent.change(screen.getByPlaceholderText('Brief summary of the issue'), { target: { value: 'Cannot export' } });
      fireEvent.change(screen.getByPlaceholderText('Detailed explanation...'), { target: { value: 'The PDF export fails.' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Ticket' }));
      await flush();
      expect(tickets).toHaveLength(1);
      expect(toasts.at(-1)).toMatchObject({ title: 'Ticket Submitted', variant: 'success' });
      expect(toasts.at(-1).className).toBeUndefined();
      expect(screen.getByRole('button', { name: 'Submit Ticket' }).className).toContain('bg-pl-primary');
    });

    it('hides the admin callout from a member and keeps the page clean', async () => {
      resetShell({ activeModule: MODULE, role: 'member' });
      renderLayout();
      await ready();
      expect(screen.queryByText('Setting up a new organization?')).toBeNull();
      expectNoLegacyChrome();
    });
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaRelative = await import('../../../lib/customSupabaseClient');
    const { supabaseModule } = await import('@/design/testing/shellMocks');
    expect(viaRelative.supabase).toBe(supabaseModule.supabase);
  });
});
