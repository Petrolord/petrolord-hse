// @vitest-environment jsdom
// Batch 3A theme test: the root loaders and error panels.
//
// - ProtectedRoute's cold-load loader paints the device's last theme on the
//   pages outside the layout and on migrated modules, and stays legacy on an
//   unmigrated module (pinned byte for byte in
//   common/__tests__/rootLegacyDom.test.jsx); its denied panels open a
//   scope through AccountScope.
// - The root ErrorBoundary panel opens its own scope in the device's last
//   theme (it sits above the auth provider).
// - The offline pill, the install prompt and the back-online toast follow
//   the scope on screen; with none they stay legacy (the pin again).
import React from 'react';
import { render, screen, act, cleanup, configure } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  installDomShims, getScopeRoot, expectNoLegacyChrome, expectNegativeControl, legacyChromeClasses, hasLegacyChrome,
} from '@/design/testing/themeAssertions';
import { ThemedApp } from '@/design/ThemeProvider';

const hse = {};
const appState = {};
const toasts = [];

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/context/HSEContext', () => ({ useHSE: () => hse }));
vi.mock('@/context/AppStateContext', () => ({ useAppState: () => appState }));
vi.mock('@/lib/offlineManager', () => ({ offlineManager: { syncPendingActions: async () => {} } }));
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: (t) => toasts.push(t) }) }));

const { default: ProtectedRoute, isOutsideLayoutPath, protectedLoaderTheme } = await import('@/components/auth/ProtectedRoute');
const { ErrorBoundary } = await import('@/components/ErrorBoundary');
const { default: OfflineIndicator } = await import('@/components/common/OfflineIndicator');
const { default: PWAInstallPrompt } = await import('@/components/common/PWAInstallPrompt');
const { default: BackgroundSync } = await import('@/components/common/BackgroundSync');

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const flush = (ms = 60) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const LAST = 'petrolord.theme.v1.last';

const renderProtected = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<div>page</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  Object.assign(hse, {
    isAuthenticated: true, isLoading: false, role: 'org_admin', accessLevel: 'premium',
    activeModule: null, checkPermission: () => true,
  });
  appState.persistedModule = null;
  toasts.length = 0;
});

describe('ProtectedRoute loader and denied panels (batch 3A)', () => {
  it('knows the pages outside the layout', () => {
    for (const p of ['/dashboard/upgrade', '/dashboard/analytics/advanced', '/dashboard/super-admin/branding', '/suite', '/suite/geoscience', '/organization', '/auditor/']) {
      expect({ p, outside: isOutsideLayoutPath(p) }).toEqual({ p, outside: true });
    }
    for (const p of ['/dashboard', '/dashboard/super-admin', '/suites', '/', null]) {
      expect({ p, outside: isOutsideLayoutPath(p) }).toEqual({ p, outside: false });
    }
    expect(protectedLoaderTheme('/dashboard', 'legacy-probe')).toBeNull();
    expect(protectedLoaderTheme('/dashboard', 'dashboard')).toBe('light');
    expect(protectedLoaderTheme('/auditor', 'legacy-probe')).toBe('light');
  });

  it('paints light on a page outside the layout, and the last theme for a returning dark user', async () => {
    hse.isLoading = true;
    renderProtected('/dashboard/upgrade');
    let loader = screen.getByTestId('protected-route-loader');
    expect(loader).toHaveAttribute('data-pl-theme', 'light');
    expect(loader).toHaveTextContent('Verifying access...');
    // it is a scope of its own, so the root pieces follow it
    expect(document.documentElement).toHaveAttribute('data-pl-active-theme', 'light');
    expectNoLegacyChrome();
    expectNegativeControl(loader);
    cleanup();

    window.localStorage.setItem(LAST, 'dark');
    renderProtected('/suite');
    loader = screen.getByTestId('protected-route-loader');
    expect(loader).toHaveAttribute('data-pl-theme', 'dark');
  });

  it('follows the rollout on the layout: themed for a migrated module, legacy for the probe', async () => {
    hse.isLoading = true;
    appState.persistedModule = { id: 'dashboard' };
    renderProtected('/dashboard');
    expect(screen.getByTestId('protected-route-loader')).toHaveAttribute('data-pl-theme', 'light');
    cleanup();

    appState.persistedModule = { id: 'legacy-probe' };
    renderProtected('/dashboard');
    expect(screen.queryByTestId('protected-route-loader')).toBeNull();
    expect(document.querySelector('[data-pl-theme]')).toBeNull();
    expect(screen.getByText('Verifying access...').parentElement.className).toContain('bg-[#1a1a2e]');
  });

  it('the access restricted panel opens a scope, with the word beside the danger icon', async () => {
    hse.accessLevel = 'none';
    renderProtected('/dashboard');
    const scope = getScopeRoot('protected-route-denied');
    expect(scope).toHaveAttribute('data-pl-theme', 'light');
    expect(screen.getByRole('heading', { level: 1, name: 'Access Restricted' })).toBeInTheDocument();
    expectNoLegacyChrome();
    expectNegativeControl(scope);
  });

  it('the premium panel opens a scope in the user\'s stored theme', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    hse.accessLevel = 'basic';
    render(
      <MemoryRouter initialEntries={['/x']}>
        <Routes>
          <Route element={<ProtectedRoute requirePremium />}>
            <Route path="*" element={<div>page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(getScopeRoot('protected-route-denied')).toHaveAttribute('data-pl-theme', 'dark');
    expect(screen.getByRole('heading', { level: 1, name: 'Premium Feature' })).toBeInTheDocument();
    expectNoLegacyChrome();
  });
});

describe('root ErrorBoundary panel (batch 3A)', () => {
  const Boom = () => { throw new Error('Render failed in test'); };
  let errorSpy;
  beforeEach(() => { errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => errorSpy.mockRestore());

  it('opens its own scope, light by default, with no legacy colour', async () => {
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    await flush();
    const scope = getScopeRoot('error-boundary-panel');
    expect(scope).toHaveAttribute('data-pl-theme', 'light');
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText(/Render failed in test/)).toBeInTheDocument();
    expect(screen.getByText('View Stack Trace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Application/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to Login' })).toBeInTheDocument();
    expectNoLegacyChrome();
    expectNegativeControl(scope);
  });

  it('paints the device\'s last theme for a returning dark user', async () => {
    window.localStorage.setItem(LAST, 'dark');
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    await flush();
    expect(getScopeRoot('error-boundary-panel')).toHaveAttribute('data-pl-theme', 'dark');
    expectNoLegacyChrome();
  });

  it('renders its children untouched when nothing fails', () => {
    render(<ErrorBoundary><p>fine</p></ErrorBoundary>);
    expect(screen.getByText('fine')).toBeInTheDocument();
    expect(document.querySelector('[data-pl-theme]')).toBeNull();
  });
});

describe('root pieces follow the scope on screen (batch 3A)', () => {
  const setOnline = (v) => Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => v });
  afterEach(() => setOnline(true));

  it('the offline pill takes the page theme, and the status keeps its word', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    setOnline(true);
    render(<><ThemedApp data-testid="page"><p>page</p></ThemedApp><OfflineIndicator /></>);
    await flush();
    let pill = screen.getByTestId('offline-indicator');
    expect(pill).toHaveAttribute('data-pl-theme', 'dark');
    expect(pill).toHaveTextContent('Online');
    expect(hasLegacyChrome(pill.className)).toBe(false);
    await act(async () => { setOnline(false); window.dispatchEvent(new Event('offline')); });
    pill = screen.getByTestId('offline-indicator');
    expect(pill).toHaveTextContent('Offline');
    expect(pill.className).toContain('bg-pl-danger-bg');
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('the install prompt takes the page theme with the gold accent button', async () => {
    render(<><ThemedApp><p>page</p></ThemedApp><PWAInstallPrompt /></>);
    await act(async () => {
      const e = new Event('beforeinstallprompt');
      e.prompt = () => {};
      e.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(e);
    });
    await flush(3300);
    const install = screen.getByRole('button', { name: 'Install Now' });
    expect(install.className).toContain('bg-pl-accent');
    expect(install.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('the back-online toast drops its legacy blue while a scope is on screen', async () => {
    render(<><ThemedApp><p>page</p></ThemedApp><BackgroundSync /></>);
    await act(async () => { window.dispatchEvent(new Event('online')); });
    expect(toasts).toEqual([{ title: 'Back Online', description: 'Syncing your offline data...' }]);
  });
});
