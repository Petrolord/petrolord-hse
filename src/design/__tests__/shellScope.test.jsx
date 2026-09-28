// @vitest-environment jsdom
// The signed-in shell (PetrolordHSE with TopBar, LeftNav, the footer and the
// ChatBot, AppSwitcher and NotificationCenter it mounts) is scoped on every
// module. Until batch 4A this file pinned the shell's legacy DOM on an
// unmigrated module (shellLegacyDom); with the rollout gate gone the same
// states now prove the opposite: the scope opens, the rail is the ink frame
// and no legacy colour is left, on every MainContent module and on the
// probe id the pin used. The module itself is stubbed; the module screens
// have their own theme tests.
import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell, shell } from '@/design/testing/shellMocks';
import { THEMES, contrastRatio } from '@/design/tokens';
import {
  installDomShims, getScopeRoot, expectNoLegacyChrome, expectNegativeControl, mainContentModuleIds,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/MainContent', async () => (await import('@/design/testing/shellMocks')).stubContentModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const mountShell = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

// Past a couple of animation frames, so framer-motion has applied its end state.
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });

const expectScopedShell = () => {
  const scope = getScopeRoot();
  expect(scope).toHaveAttribute('data-pl-theme', 'light');
  expect(scope.querySelector('[data-testid="theme-toggle"]')).not.toBeNull();
  const rail = scope.querySelector('[data-testid="hse-ink-rail"]');
  expect(rail).not.toBeNull();
  expect(rail).toHaveAttribute('data-pl-theme', 'dark');
  expectNoLegacyChrome();
  return scope;
};

describe('signed-in shell: every module is scoped', () => {
  beforeAll(installDomShims);
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  });

  it('opens the scope, the toggle and the ink rail on every MainContent module and the old probe id', async () => {
    const ids = await mainContentModuleIds();
    for (const id of [...ids, 'legacy-probe']) {
      resetShell({ activeModule: { id, label: id } });
      const view = mountShell();
      await flush();
      expect(shell.activeModule.id).toBe(id);
      expectScopedShell();
      view.unmount();
    }
  }, 30000);

  it('the expanded shell has no legacy colour (with a negative control)', async () => {
    resetShell({ activeModule: { id: 'legacy-probe', label: 'Legacy probe' } });
    mountShell();
    await flush();
    expectNegativeControl(expectScopedShell());
  });

  it('the chat panel open', async () => {
    resetShell({ activeModule: { id: 'legacy-probe', label: 'Legacy probe' } });
    mountShell();
    await flush();
    fireEvent.click(screen.getByTitle('Open Chat Assistant'));
    await flush();
    expectScopedShell();
  });

  it('the notifications popover open', async () => {
    resetShell({ activeModule: { id: 'legacy-probe', label: 'Legacy probe' } });
    mountShell();
    await flush();
    fireEvent.click(document.querySelector('header button.relative'));
    await flush();
    expectScopedShell();
  });

  it('the app switcher menu open', async () => {
    resetShell({ activeModule: { id: 'legacy-probe', label: 'Legacy probe' } });
    mountShell();
    await flush();
    fireEvent.keyDown(screen.getByText('Current App').closest('button'), { key: 'Enter' });
    await flush();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expectScopedShell();
  });

  it('the collapsed rail (tooltips on the icons)', async () => {
    resetShell({ activeModule: { id: 'legacy-probe', label: 'Legacy probe' }, sidebarCollapsed: true });
    mountShell();
    await flush();
    expectScopedShell();
  });
});

describe('ink rail legibility (reported by 2A)', () => {
  beforeAll(installDomShims);

  it('section labels and Sign Out use roles that reach 4.5:1 on the dark rail, with no fade-in', async () => {
    resetShell({ activeModule: { id: 'dashboard', label: 'Dashboard' } });
    mountShell();
    await flush();
    const rail = document.querySelector('[data-testid="hse-ink-rail"]');
    const roleOf = (el) => (el.className.match(/(?:^|\s)text-pl-([a-z-]+)(?=\s|$)/) || [])[1];
    const labels = [...rail.querySelectorAll('h3')];
    const signOut = [...rail.querySelectorAll('button')].find((b) => /Sign Out/.test(b.textContent));
    expect(labels.length).toBeGreaterThan(3);
    expect(signOut).toBeTruthy();
    const surface = THEMES.dark.surface;
    expect(rail.firstElementChild.className).toContain('bg-pl-surface');
    for (const el of [...labels, signOut]) {
      const role = roleOf(el);
      expect({ text: el.textContent, role }).toEqual({ text: el.textContent, role: expect.any(String) });
      expect(contrastRatio(THEMES.dark[role], surface)).toBeGreaterThanOrEqual(4.5);
      expect(el.className).not.toMatch(/(?:^|\s)(?:fade-in|opacity-\d)/);
    }
    // Sign Out sits clear of the root Online pill (fixed bottom-4, about 26px tall)
    expect(signOut.parentElement.className).toContain('pb-12');
  });
});

describe('phone: the nav drawer starts closed', () => {
  beforeAll(installDomShims);
  const width = window.innerWidth;
  afterEach(() => { window.innerWidth = width; });

  it('opens with the rail beside the page on a desktop (lg and up)', async () => {
    window.innerWidth = 1440;
    resetShell({ activeModule: { id: 'dashboard', label: 'Dashboard' } });
    mountShell();
    await flush();
    expect(document.querySelectorAll('[data-testid="hse-ink-rail"]').length).toBe(2);
  });

  it('opens with no drawer over the page below lg, and the menu button opens it', async () => {
    window.innerWidth = 390;
    resetShell({ activeModule: { id: 'dashboard', label: 'Dashboard' } });
    mountShell();
    await flush();
    expect(document.querySelector('[data-testid="hse-ink-rail"]')).toBeNull();
    fireEvent.click(screen.getByLabelText('Open navigation'));
    await flush();
    expect(document.querySelectorAll('[data-testid="hse-ink-rail"]').length).toBe(2);
  });
});
