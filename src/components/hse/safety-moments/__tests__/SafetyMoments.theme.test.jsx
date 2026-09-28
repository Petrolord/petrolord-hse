// @vitest-environment jsdom
// Batch 2C theme test: Safety Moments (module id safety-moments-bank) in the
// signed-in layout (docs/scope/DesignSystem-Rollout.md sections 3.3 and 8.2).
//
// It mounts the real PetrolordHSE layout on the module and walks its states:
// the library with a saved card, the filters and their select menu (a
// portal), the empty library, the Overview tab, the Saved tab, the moment
// sheet with its Do and Avoid words and the Export menu, and the create
// dialog's four tabs, in light and in dark. It also opens the scope-aware
// Quick Report (batch 1A) from the header on this module, with the 1A
// walk-through. Only the data layer is stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses, themeScopes,
} from '@/design/testing/themeAssertions';
import {
  installReportingShims, walkQuickReport, flush, qr, toasts, ANALYSIS, REPORTS, orgData,
} from '@/components/hse/__tests__/reportingFixtures';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/components/hse/__tests__/reportingFixtures')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/components/hse/__tests__/reportingFixtures')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/ui/use-toast', async () => (await import('@/components/hse/__tests__/reportingFixtures')).useToastModule);
// The Quick Report flow's data layer, as batch 1A stubs it.
vi.mock('@/services/quickReportService', async () => (await import('@/components/hse/__tests__/reportingFixtures')).quickReportServiceModule);
vi.mock('@/hooks/useOrganizationData', async () => (await import('@/components/hse/__tests__/reportingFixtures')).orgDataModule);
vi.mock('@/services/requestThrottleService', async () => (await import('@/components/hse/__tests__/reportingFixtures')).throttleModule);
vi.mock('@/services/aiAnalysisService', async () => (await import('@/components/hse/__tests__/reportingFixtures')).aiAnalysisModule);
vi.mock('@/services/notificationService', async () => (await import('@/components/hse/__tests__/reportingFixtures')).notificationServiceModule);
vi.mock('@/lib/offlineManager', async () => (await import('@/components/hse/__tests__/reportingFixtures')).offlineModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
// The exports build PDF, PPTX and Word files; the theme test never runs them.
vi.mock('@/utils/exportUtils', () => ({ exportToPDF: async () => {}, exportToPPTX: async () => {}, exportToWord: async () => {} }));

const CATEGORIES = [{ id: 'c1', name: 'Working at Height' }, { id: 'c2', name: 'Hot Work' }];
const MOMENTS = [
  {
    id: 'm1', title: 'Ladder safety fundamentals', duration: 5, shares_count: 3,
    category: { id: 'c1', name: 'Working at Height', color: '#ef4444' },
    one_minute_recap: 'Three points of contact, every time.',
    when_to_use: 'Before any work at height.',
    why_it_matters: 'Falls from ladders are a leading cause of injury.',
    key_talking_points: ['Inspect the ladder', 'Keep three points of contact'],
    do_list: ['Face the ladder'], dont_list: ['Overreach'],
    incident_scenario: { what_happened: 'A fitter fell from a step ladder.', what_should_happen: 'A platform ladder.', lesson: 'Pick the right access.' },
    discussion_questions: ['When did you last inspect a ladder?'],
    site_checklist: ['Ladder tagged'], references: ['OSHA 1926.1053'],
  },
  {
    id: 'm2', title: 'Hot work permits', duration: 10, shares_count: 0,
    category: { id: 'c2', name: 'Hot Work', color: '#f59e0b' }, description: 'Why a permit comes first.',
  },
];
const sm = { moments: MOMENTS, saved: ['m1'] };

vi.mock('@/services/safetyMomentService', () => ({
  safetyMomentService: {
    fetchCategories: async () => CATEGORIES,
    fetchSavedMomentIds: async () => sm.saved,
    fetchMoments: async () => sm.moments,
    toggleSave: async () => true,
    seedMoments: async () => ({ count: 2 }),
    trackView: async () => {},
    trackDownload: async () => {},
    createUserMoment: async () => ({}),
  },
}));

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const MODULE = { id: 'safety-moments-bank', label: 'Safety Moments' };

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };
const ready = async () => {
  await screen.findByText('Ladder safety fundamentals');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const toDark = () => fireEvent.click(within(getScopeRoot()).getAllByTestId('theme-toggle')[0]);

// Every scope and portal carries the chosen theme (the ink rail is dark in both).
const expectTheme = (theme) => {
  const scopes = themeScopes().filter((s) => !s.closest('[data-testid="hse-ink-rail"]'));
  expect([...new Set(scopes.map((s) => s.getAttribute('data-pl-theme')))]).toEqual([theme]);
};

describe('Safety Moments', () => {
  beforeAll(() => {
    installDomShims();
    installReportingShims();
    // jsdom has no clipboard; the copy buttons write to it.
    if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
  });
  beforeEach(() => {
    resetShell({ activeModule: MODULE });
    sm.moments = MOMENTS;
    sm.saved = ['m1'];
    toasts.length = 0;
  });

  describeModuleTheme({ name: 'Safety Moments', moduleId: 'safety-moments-bank', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('shows the library with neutral category tags and the saved word, and the category menu themed', async () => {
      renderLayout();
      await ready();
      expect(screen.getAllByText('Working at Height')[0].className).toContain('bg-pl-sunken');
      expect(screen.getAllByText('Working at Height')[0].getAttribute('style')).toBeNull();
      expect(screen.getByText('Saved', { selector: '.sr-only' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Moment/ }).className).toContain('bg-pl-primary');
      click(screen.getAllByRole('combobox')[0]);
      await screen.findByRole('option', { name: 'Hot Work' });
      expect(screen.getByRole('listbox').closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('shows the empty library, the Overview and the Saved tab on roles', async () => {
      renderLayout();
      await ready();
      await clickTab(/Overview/);
      await screen.findByText('Quick Stats');
      expect(screen.getByText('Total Moments').parentElement.querySelector('h3').className).toContain('font-pl-mono');
      expect(screen.getByText('Avg Duration').parentElement.querySelector('h3')).toHaveTextContent('8m');
      expectNoLegacyChrome();
      await clickTab(/Saved/);
      await screen.findByText('Ladder safety fundamentals');
      expect(screen.queryByText('Hot work permits')).toBeNull();
      expectNoLegacyChrome();
    });

    it('shows n/a for the average duration and the empty state when there are no moments', async () => {
      sm.moments = [];
      renderLayout();
      await screen.findByText('No safety moments found.');
      expectNoLegacyChrome();
      await clickTab(/Overview/);
      await screen.findByText('Quick Stats');
      expect(screen.getByText('Avg Duration').parentElement.querySelector('h3')).toHaveTextContent('n/a');
      expectNoLegacyChrome();
    });

    it('opens the moment sheet with the Do and Avoid words and the Export menu, in light and in dark', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByText('Ladder safety fundamentals'));
      const sheet = await screen.findByRole('dialog');
      await flush();
      expect(sheet.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(sheet).getByText('Do This').className).toContain('text-pl-success-text');
      expect(within(sheet).getByText('Avoid This').className).toContain('text-pl-danger-text');
      expect(within(sheet).getByText('Real World Scenario').className).toContain('text-pl-info-text');
      expect(within(sheet).getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
      expectNoLegacyChrome();
      fireEvent.keyDown(within(sheet).getByRole('button', { name: /Export/ }), { key: 'Enter' });
      await screen.findByRole('menuitem', { name: /PDF Document/ });
      expectTheme('light');
      expectNoLegacyChrome();
      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      await flush();

      toDark();
      await flush();
      expectTheme('dark');
      expectNoLegacyChrome();
      fireEvent.click(within(screen.getByRole('dialog')).getAllByRole('button', { name: /Copy All Text/ })[0]);
      expect(toasts.at(-1)).toMatchObject({ title: 'Copied to Clipboard', variant: 'success' });
      expect(toasts.at(-1).className).toBeUndefined();
    });

    it('walks the create dialog tabs with no legacy colour, in dark', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      fireEvent.click(screen.getByRole('button', { name: /Create Moment/ }));
      const dialog = await screen.findByRole('dialog');
      await flush();
      expect(within(dialog).getByText('Create Custom Safety Moment')).toBeInTheDocument();
      expectTheme('dark');
      expectNoLegacyChrome();
      for (const name of [/Key Content/, /Scenario & Engagement/, /Summary & Review/]) {
        await clickTab(name);
        expectNoLegacyChrome();
      }
      await clickTab(/Key Content/);
      expect(within(dialog).getByText('DO List').className).toContain('text-pl-success-text');
      expect(within(dialog).getByText("DON'T List").className).toContain('text-pl-danger-text');
    });

    it('restocks the library with a success toast and no painted class', async () => {
      renderLayout();
      await ready();
      fireEvent.click(screen.getByRole('button', { name: /Restock Library/ }));
      await flush();
      expect(toasts.at(-1)).toMatchObject({ title: 'Library Updated', variant: 'success' });
      expect(toasts.at(-1).className).toBeUndefined();
    });

    it('opens the scope-aware Quick Report (batch 1A) themed on this module', async () => {
      qr.analyze = async () => ANALYSIS;
      qr.reports = REPORTS;
      orgData.departments = [];
      orgData.sites = [];
      renderLayout();
      await ready();
      fireEvent.click(screen.getByRole('button', { name: /Quick Report/ }));
      await walkQuickReport((name) => {
        expect({ name, legacy: legacyChromeClasses() }).toEqual({ name, legacy: [] });
      });
      expectTheme('light');
    });
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaRelative = await import('../../../../lib/customSupabaseClient');
    const { supabaseModule } = await import('@/design/testing/shellMocks');
    expect(viaRelative.supabase).toBe(supabaseModule.supabase);
  });
});
