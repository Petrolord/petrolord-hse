// TEST-ONLY. Stand-ins for the signed-in shell's contexts and data layer, so
// a theme test can mount PetrolordHSE (TopBar, LeftNav, the module and the
// footer) with no network. Use from a test file's vi.mock factories:
//
//   vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
//
// and set `shell.activeModule` / `shell.role` / `shell.sidebarCollapsed`
// before rendering. Never import this file from application code.
import React from 'react';

export const shell = {
  activeModule: { id: 'dashboard', label: 'Dashboard' },
  role: 'org_admin',
  sidebarCollapsed: false,
  user: {
    id: 'u1',
    email: 'lead@example.com',
    user_metadata: { full_name: 'Test Lead', primary_app: 'hse', subscribed_modules: ['hse_free'] },
  },
  organization: { id: 'o1', name: 'Test Org', setup_completed: true },
};

export function resetShell(overrides = {}) {
  shell.activeModule = { id: 'dashboard', label: 'Dashboard' };
  shell.role = 'org_admin';
  shell.sidebarCollapsed = false;
  Object.assign(shell, overrides);
}

// A Supabase client stand-in: every builder call chains, awaiting any chain
// resolves to an empty result, realtime channels are inert.
function chain() {
  const result = { data: null, error: null, count: 0 };
  const proxy = new Proxy(function stub() {}, {
    get(_t, prop) {
      if (prop === 'then') return (res, rej) => Promise.resolve(result).then(res, rej);
      if (prop === 'catch') return (fn) => Promise.resolve(result).catch(fn);
      if (prop === 'finally') return (fn) => Promise.resolve(result).finally(fn);
      return proxy;
    },
    apply() { return proxy; },
  });
  return proxy;
}

export const supabaseModule = {
  supabase: {
    from: () => chain(),
    rpc: () => chain(),
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: () => {},
    functions: { invoke: async () => ({ data: null, error: null }) },
    storage: { from: () => chain() },
    auth: {
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: shell.user }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
};

const noop = () => {};

export const hseContextModule = {
  HSEContext: React.createContext(null),
  HSEProvider: ({ children }) => children,
  useHSE: () => ({
    isAuthenticated: true,
    isLoading: false,
    activeModule: shell.activeModule,
    setActiveModule: noop,
    role: shell.role,
    currentUser: shell.user,
    currentOrganization: shell.organization,
    organization: shell.organization,
    sidebarCounts: {},
    refreshContext: noop,
  }),
};

export const globalUiModule = {
  GlobalUIProvider: ({ children }) => children,
  useGlobalUI: () => ({
    isReportWizardOpen: false, openReportWizard: noop, closeReportWizard: noop, triggerDashboardRefresh: noop,
    dashboardRefreshKey: 0,
  }),
};

export const appStateModule = {
  AppStateProvider: ({ children }) => children,
  useAppState: () => ({
    persistedModule: shell.activeModule,
    setPersistedModule: noop,
    sidebarCollapsed: shell.sidebarCollapsed,
    toggleSidebar: noop,
    pageState: {},
    setPageState: noop,
  }),
};

export const authModule = {
  AuthContext: React.createContext(null),
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: shell.user, session: { user: shell.user }, loading: false, isAuthenticated: true, signOut: async () => {} }),
};

export const gamificationModule = {
  gamificationService: new Proxy({}, {
    get: (_t, prop) => async () => (prop === 'getUserScore'
      ? { total_points: 120, current_streak: 3, level: 2 }
      : []),
  }),
};

export const chatbotModule = {
  chatbotService: {
    loadHistoryFromLocal: () => null,
    saveHistoryToLocal: noop,
    clearHistory: noop,
    sendMessage: async () => ({ content: 'ok' }),
  },
};

/** A module stand-in for MainContent, so a shell test renders no module. */
export const stubContentModule = {
  default: () => <div data-testid="module-content">module content</div>,
};

/** Closed-by-default dialogs the shell mounts (their own batch migrates them). */
export const nullComponentModule = { default: () => null };
