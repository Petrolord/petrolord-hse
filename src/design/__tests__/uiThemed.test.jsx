// @vitest-environment jsdom
// The HSE ui kit inside a design-system scope: every routed primitive, with
// its portals open, renders theme roles only (no legacy class, no shadcn
// class the Suite kit dropped), and every portal carries the scope's theme
// so dialogs, menus, selects, popovers, tooltips and sheets follow the
// user's choice. A planted legacy class proves the detector works.
import React from 'react';
import { render, act } from '@testing-library/react';
import { ThemedApp } from '@/design/ThemeProvider';
import {
  installDomShims, legacyChromeClasses, expectNoLegacyChrome, expectNegativeControl,
} from '@/design/testing/themeAssertions';
import { InlineScene, PortalScene } from './uiScenes';

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
});

const PORTAL_ROLES = ['dialog', 'alertdialog', 'menu', 'listbox', 'tooltip'];

// The stock shadcn colour tokens the kit must not emit inside a scope (they
// would follow the theme through the re-pointed variables, but the kit is
// meant to use the roles, as the Suite kit does).
const SHADCN_COLOUR = /(^|\s)(?:[a-z-]+:)*(?:bg|text|border|ring|ring-offset)-(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|ring)(?:-foreground)?(?:\/\d+)?(?=\s|$)/;

const renderScoped = (theme = 'light') => {
  window.localStorage.setItem('petrolord.theme.v1:anon', theme);
  return render(
    <ThemedApp data-testid="kit-scope">
      <InlineScene />
      <PortalScene />
    </ThemedApp>,
  );
};

describe('ui kit inside a scope', () => {
  it('renders no legacy colour class, portals included (with a negative control)', () => {
    const { getByTestId } = renderScoped();
    expectNoLegacyChrome();
    expectNegativeControl(getByTestId('kit-scope'));
  });

  it('drops the stock shadcn colour tokens in favour of the roles', () => {
    renderScoped();
    const offenders = [];
    document.querySelectorAll('[data-pl-theme] [class], [data-pl-theme][class]').forEach((el) => {
      const cls = el.getAttribute('class');
      if (SHADCN_COLOUR.test(cls)) offenders.push(cls);
    });
    expect(offenders).toEqual([]);
  });

  it('puts the scope theme on every open portal, and they follow a switch to dark', () => {
    const { getByTestId } = renderScoped();
    const portals = () => PORTAL_ROLES.flatMap((r) => [...document.querySelectorAll(`[role="${r}"]`)]);
    expect(portals().length).toBeGreaterThanOrEqual(PORTAL_ROLES.length);
    for (const el of portals()) {
      expect(el.closest('[data-pl-theme]')).not.toBeNull();
      expect(el.closest('[data-pl-theme]').getAttribute('data-pl-theme')).toBe('light');
    }
    expect(getByTestId('kit-scope')).toHaveAttribute('data-pl-theme', 'light');
  });

  it('renders dark portals for a user who chose dark', () => {
    renderScoped('dark');
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.closest('[data-pl-theme]').getAttribute('data-pl-theme')).toBe('dark');
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('uses the Suite field styling for inputs (owner decision)', () => {
    renderScoped();
    const input = document.querySelector('input[placeholder="Name"]');
    expect(input.className).toContain('border-pl-border-strong');
    expect(input.className).toContain('bg-pl-surface');
    expect(input.className).toContain('focus-visible:ring-pl-focus');
    const trigger = document.querySelector('[role="combobox"]');
    expect(trigger.className).toContain('border-pl-border-strong');
  });

  it('themes toasts only while a scope is on screen', async () => {
    const { Toaster } = await import('@/components/ui/toaster');
    const { toast } = await import('@/components/ui/use-toast');
    const { unmount } = render(<Toaster />);
    act(() => { toast({ title: 'Outside' }); });
    const outside = document.querySelector('ol');
    expect(outside.closest('[data-pl-theme]')).toBeNull();
    unmount();

    render(<><ThemedApp><p>page</p></ThemedApp><Toaster /></>);
    act(() => { toast({ title: 'Inside' }); });
    const viewport = [...document.querySelectorAll('ol')].pop();
    expect(viewport).toHaveAttribute('data-pl-theme', 'light');
    expect(legacyChromeClasses()).toEqual([]);
  });
});
