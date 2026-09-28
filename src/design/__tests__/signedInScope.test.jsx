// @vitest-environment jsdom
// The HSE scope plumbing: the scope opens for every module (the rollout
// gate is gone since batch 4A), the per-user storage key shared with the
// Suite, the cold-load loader and the toggle's visibility rules.
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '@/contexts/SupabaseAuthContext';
import {
  ThemedApp, FixedTheme, themeStorageKey, LAST_THEME_KEY,
} from '@/design/ThemeProvider';
import { SignedInScope, ThemedLoadingScreen, SIGNED_IN_SCOPE_TEST_ID } from '@/design/SignedInScope';
import { useActiveTheme } from '@/design/activeTheme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { installDomShims } from '@/design/testing/domShims';
import { mainContentModuleIds } from '@/design/testing/themeAssertions';

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
});

describe('every module is scoped', () => {
  it('the rollout folder and the useThemeClass helper are gone', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const design = path.resolve(__dirname, '..');
    expect(fs.existsSync(path.join(design, 'rollout'))).toBe(false);
    expect(fs.existsSync(path.join(design, 'themeClass.js'))).toBe(false);
    expect(fs.existsSync(path.join(design, 'index.js'))).toBe(true);
  });

  it('opens a light scope with the toggle whatever the module, known or not', async () => {
    const ids = await mainContentModuleIds();
    expect(ids.length).toBeGreaterThanOrEqual(24);
    // 'legacy-probe' is the id the rollout-era tests used for an unmigrated
    // module; SignedInScope no longer reads the module, so it is scoped too.
    for (const id of [...ids, 'legacy-probe', undefined]) {
      const { unmount } = render(<SignedInScope data-module={id}><ThemeToggle /></SignedInScope>);
      const scope = screen.getByTestId(SIGNED_IN_SCOPE_TEST_ID);
      expect(scope).toHaveAttribute('data-pl-theme', 'light');
      expect(scope).toHaveAttribute('data-pl-root');
      expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false');
      unmount();
    }
  });
});

describe('per-user choice', () => {
  const withUser = (user, loading = false) => ({ children }) => (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  );

  it('uses the Suite key, petrolord.theme.v1:<uid>', () => {
    expect(themeStorageKey('abc')).toBe('petrolord.theme.v1:abc');
    expect(themeStorageKey(null)).toBe('petrolord.theme.v1:anon');
  });

  it('stores the signed-in user\'s choice under their key and keeps it apart from other users', () => {
    const { unmount } = render(<ThemedApp data-testid="s"><ThemeToggle /></ThemedApp>, { wrapper: withUser({ id: 'u-1' }) });
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(window.localStorage.getItem('petrolord.theme.v1:u-1')).toBe('dark');
    expect(window.localStorage.getItem(LAST_THEME_KEY)).toBe('dark');
    unmount();
    render(<ThemedApp data-testid="s2" />, { wrapper: withUser({ id: 'u-2' }) });
    expect(screen.getByTestId('s2')).toHaveAttribute('data-pl-theme', 'light');
  });

  it('while the session restores, paints the device\'s last theme', () => {
    window.localStorage.setItem(LAST_THEME_KEY, 'dark');
    render(<ThemedApp data-testid="s" />, { wrapper: withUser(null, true) });
    expect(screen.getByTestId('s')).toHaveAttribute('data-pl-theme', 'dark');
  });

  it('never follows the operating system preference', () => {
    window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    render(<ThemedApp data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-pl-theme', 'light');
  });
});

describe('ThemedLoadingScreen', () => {
  function ActiveProbe() {
    return <span data-testid="active">{String(useActiveTheme())}</span>;
  }

  it('paints the device\'s last theme as a scope of its own and publishes it (cold load)', () => {
    window.localStorage.setItem(LAST_THEME_KEY, 'dark');
    render(<><ThemedLoadingScreen label="Loading" /><ActiveProbe /></>);
    const loader = screen.getByTestId('hse-themed-loader');
    expect(loader).toHaveAttribute('data-pl-theme', 'dark');
    expect(loader).toHaveAttribute('data-pl-root');
    expect(loader).toHaveAttribute('role', 'status');
    // the root pieces (offline pill, toaster) read this
    expect(screen.getByTestId('active')).toHaveTextContent('dark');
  });

  it('is light when the device has no last theme', () => {
    render(<><ThemedLoadingScreen label="Loading" /><ActiveProbe /></>);
    expect(screen.getByTestId('hse-themed-loader')).toHaveAttribute('data-pl-theme', 'light');
    expect(screen.getByTestId('active')).toHaveTextContent('light');
  });
});

describe('ThemeToggle', () => {
  it('renders nothing outside a scope and inside the fixed ink rail', () => {
    const { container } = render(<ThemeToggle />);
    expect(container.innerHTML).toBe('');
    render(<FixedTheme theme="dark"><span data-testid="rail"><ThemeToggle /></span></FixedTheme>);
    expect(screen.getByTestId('rail').innerHTML).toBe('');
  });
});
