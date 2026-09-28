// @vitest-environment jsdom
// Batch 3A: the root pieces App.jsx mounts beside the routes (the offline
// pill, the install prompt, the back-online toast) and ProtectedRoute's
// loader on a signed-in module that has not migrated render exactly what
// they rendered before the batch, whenever no design-system scope is on
// screen (the homepage, the public pages, an unmigrated module).
//
// rootLegacyDom.json was captured from main 322c3f7 before these files were
// made scope-aware (UPDATE_ROOT_LEGACY_DOM=1 writes it). framer-motion's
// inline animation styles are stripped; the classes are what is pinned.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { installDomShims } from '@/design/testing/domShims';
import { normaliseDom } from '@/design/__tests__/uiScenes';

const hse = { isAuthenticated: true, isLoading: true, role: 'org_admin', accessLevel: 'premium', activeModule: null, checkPermission: () => true };
const appState = { persistedModule: { id: 'legacy-probe', label: 'Legacy probe' } };
const toasts = [];

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', () => ({ useHSE: () => hse }));
vi.mock('@/context/AppStateContext', () => ({ useAppState: () => appState }));
vi.mock('@/lib/offlineManager', () => ({ offlineManager: { syncPendingActions: async () => {} } }));
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: (t) => toasts.push(t) }) }));

const { default: OfflineIndicator } = await import('@/components/common/OfflineIndicator');
const { default: PWAInstallPrompt } = await import('@/components/common/PWAInstallPrompt');
const { default: BackgroundSync } = await import('@/components/common/BackgroundSync');
const { default: ProtectedRoute } = await import('@/components/auth/ProtectedRoute');

const FIXTURE = path.join(__dirname, 'rootLegacyDom.json');
const UPDATE = process.env.UPDATE_ROOT_LEGACY_DOM === '1';

const flush = (ms = 60) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const dom = () => normaliseDom(document.body.innerHTML).replace(/ style="[^"]*"/g, '');
const setOnline = (v) => Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => v });
const setUserAgent = (v) => Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => v });
const DESKTOP_UA = window.navigator.userAgent;

async function captureStates() {
  const out = {};

  setOnline(true);
  render(<OfflineIndicator />);
  await flush();
  out.offlineIndicatorOnline = dom();
  await act(async () => { setOnline(false); window.dispatchEvent(new Event('offline')); });
  await flush();
  out.offlineIndicatorOffline = dom();
  cleanup();
  setOnline(true);

  setUserAgent(DESKTOP_UA);
  render(<PWAInstallPrompt />);
  await act(async () => {
    const e = new Event('beforeinstallprompt');
    e.prompt = () => {};
    e.userChoice = Promise.resolve({ outcome: 'dismissed' });
    window.dispatchEvent(e);
  });
  await flush(3300);
  out.installPromptAndroid = dom();
  cleanup();

  try { window.sessionStorage.clear(); } catch { /* storage unavailable */ }
  setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
  render(<PWAInstallPrompt />);
  await flush(3300);
  out.installPromptIOS = dom();
  cleanup();
  setUserAgent(DESKTOP_UA);

  toasts.length = 0;
  render(<BackgroundSync />);
  await act(async () => { window.dispatchEvent(new Event('online')); });
  out.backOnlineToast = JSON.stringify(toasts);
  cleanup();

  hse.isLoading = true;
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<div>module</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  await flush();
  out.protectedLoaderUnmigrated = dom();
  cleanup();

  return out;
}

describe('root pieces outside every scope stay legacy (batch 3A pin)', () => {
  beforeAll(installDomShims);

  it('match the capture from main byte for byte', async () => {
    const states = await captureStates();
    if (UPDATE) {
      fs.writeFileSync(FIXTURE, `${JSON.stringify(states, null, 2)}\n`);
      return;
    }
    const pinned = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
    expect(Object.keys(states)).toEqual(Object.keys(pinned));
    for (const key of Object.keys(pinned)) {
      expect({ key, dom: states[key] }).toEqual({ key, dom: pinned[key] });
    }
  }, 30000);
});
