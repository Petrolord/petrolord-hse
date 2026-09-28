// @vitest-environment jsdom
// The HSE scope plumbing: the rollout gate, the per-user storage key shared
// with the Suite, the cold-load loader, the toggle's visibility rules and
// the useThemeClass call shapes.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '@/contexts/SupabaseAuthContext';
import {
  ThemedApp, FixedTheme, themeStorageKey, LAST_THEME_KEY,
} from '@/design/ThemeProvider';
import { SignedInScope, ThemedLoadingScreen, SIGNED_IN_SCOPE_TEST_ID } from '@/design/SignedInScope';
import { isThemedModule, THEMED_MODULES, ROLLOUT_BATCHES, DEFAULT_MODULE } from '@/design/rollout';
import { themeClassPicker } from '@/design/themeClass';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { installDomShims } from '@/design/testing/domShims';

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
});

describe('rollout lists', () => {
  it('wave 0 themes the dashboard and the AI Analytics module', () => {
    expect(ROLLOUT_BATCHES.w0).toEqual(['dashboard', 'ai-analytics']);
    expect(isThemedModule('dashboard')).toBe(true);
    expect(isThemedModule('ai-analytics')).toBe(true);
  });

  it('treats no module as the default dashboard, as MainContent does', () => {
    expect(DEFAULT_MODULE).toBe('dashboard');
    expect(isThemedModule(undefined)).toBe(true);
    expect(isThemedModule(null)).toBe(true);
  });

  it('leaves every other module legacy', () => {
    // 'legacy-probe' is an id no batch lists (batch 1B migrated 'permits').
    for (const id of ['legacy-probe']) expect(isThemedModule(id)).toBe(false);
  });

  it('lists each module once, only real MainContent module ids, one file per batch', () => {
    const all = Object.values(ROLLOUT_BATCHES).flat();
    expect(new Set(all).size).toBe(all.length);
    const main = fs.readFileSync(path.resolve(__dirname, '../../components/MainContent.jsx'), 'utf8');
    const ids = [...main.matchAll(/case '([a-z-]+)':/g)].map((m) => m[1]);
    for (const id of THEMED_MODULES) expect(ids).toContain(id);
    const files = fs.readdirSync(path.resolve(__dirname, '../rollout')).filter((f) => /^w\w+\.js$/.test(f));
    expect(files.map((f) => f.replace('.js', '')).sort()).toEqual(Object.keys(ROLLOUT_BATCHES).sort());
  });
});

describe('SignedInScope', () => {
  it('renders an unmigrated module with no wrapper and no toggle', () => {
    const { container } = render(
      <SignedInScope moduleId="legacy-probe"><p className="legacy">legacy</p><ThemeToggle /></SignedInScope>,
    );
    expect(container.innerHTML).toBe('<p class="legacy">legacy</p>');
  });

  it('opens a light scope with the toggle on a migrated module', () => {
    render(<SignedInScope moduleId="dashboard"><ThemeToggle /></SignedInScope>);
    const scope = screen.getByTestId(SIGNED_IN_SCOPE_TEST_ID);
    expect(scope).toHaveAttribute('data-pl-theme', 'light');
    expect(scope).toHaveAttribute('data-pl-root');
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false');
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
  it('paints the last theme on a migrated module and nothing elsewhere', () => {
    window.localStorage.setItem(LAST_THEME_KEY, 'dark');
    const { container, rerender } = render(<ThemedLoadingScreen moduleId="dashboard" label="Loading" />);
    expect(screen.getByTestId('hse-themed-loader')).toHaveAttribute('data-pl-theme', 'dark');
    rerender(<ThemedLoadingScreen moduleId="legacy-probe" label="Loading" />);
    expect(container.innerHTML).toBe('');
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

describe('useThemeClass (themeClassPicker)', () => {
  it('returns the legacy string unchanged outside a scope, whatever is passed', () => {
    const tc = themeClassPicker(null);
    expect(tc('bg-[#1a1a2e] text-white', 'bg-pl-surface')).toBe('bg-[#1a1a2e] text-white');
    expect(tc('text-gray-400', undefined)).toBe('text-gray-400');
    expect(tc(undefined, 'Label')).toBeUndefined();
  });

  it('inside a scope returns the themed argument, even undefined, else the table entry', () => {
    const tc = themeClassPicker({ theme: 'light' }, { 'text-white': 'text-pl-text' });
    expect(tc('bg-[#1a1a2e]', 'bg-pl-surface')).toBe('bg-pl-surface');
    expect(tc('text-gray-400', undefined)).toBeUndefined();
    expect(tc('text-white')).toBe('text-pl-text');
    expect(tc('p-4')).toBe('p-4');
  });
});
