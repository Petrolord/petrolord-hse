// TEST-ONLY. Stand-ins and walk-throughs for the reporting dialogs of batch
// 1A (docs/scope/DesignSystem-Rollout.md sections 2.1 and 3.2): the Quick
// Report flow, the Report Wizard (with its template picker, location search
// and map frame) and the Upgrade modal.
//
// Two tests share them:
//   reportingLegacyDom.test.jsx   walks each flow OUTSIDE a scope and pins the
//                                 DOM byte for byte (the dialogs open from the
//                                 TopBar on every module, migrated or not);
//   Reporting.theme.test.jsx      walks the same flows INSIDE the scope and
//                                 checks the roles in light and dark.
// Every data call is stubbed; nothing here reaches the network.
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { shell } from '@/design/testing/shellMocks';

/** useToast stand-in: every toast() call is recorded, so a test can check its payload. */
export const toasts = [];
export const useToastModule = {
  useToast: () => ({ toast: (t) => { toasts.push(t); return { id: String(toasts.length) }; }, toasts: [], dismiss: () => {} }),
  toast: (t) => { toasts.push(t); },
};

export const flush = (ms = 60) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

// ---------------------------------------------------------------------------
// Context stand-ins. HSEContext's default value is the signed-in user, so a
// component that reads it with useContext (QuickReport does) works with no
// provider, as it does in the app.
// currentUser keeps one identity per shell user, so effects keyed on it do
// not re-run on every render.
let userCache = { from: null, value: null };
const currentUser = () => {
  if (userCache.from !== shell.user) userCache = { from: shell.user, value: { ...shell.user, name: 'Test Lead' } };
  return userCache.value;
};
const hseValue = () => ({
  isAuthenticated: true,
  isLoading: false,
  activeModule: shell.activeModule,
  setActiveModule: () => {},
  role: shell.role,
  currentUser: currentUser(),
  currentOrganization: shell.organization,
  organization: shell.organization,
  sidebarCounts: {},
  refreshContext: () => {},
});
const liveHse = new Proxy({}, { get: (_t, prop) => hseValue()[prop] });

export const hseContextModule = {
  HSEContext: React.createContext(liveHse),
  HSEProvider: ({ children }) => children,
  useHSE: () => hseValue(),
};

/** The layout's GlobalUI context with the wizard dialog switchable per test. */
export const ui = { wizardOpen: false };
export const globalUiModule = {
  GlobalUIProvider: ({ children }) => children,
  useGlobalUI: () => ({
    isReportWizardOpen: ui.wizardOpen,
    openReportWizard: () => {},
    closeReportWizard: () => {},
    triggerDashboardRefresh: () => {},
    dashboardRefreshKey: 0,
  }),
};

// ---------------------------------------------------------------------------
// Data stand-ins.
export const REPORTS = [
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000001',
    title: 'Loose handrail on stair B',
    description: 'Handrail bolts missing at the second landing.',
    created_at: '2026-09-20T09:15:00Z',
    severity: 'high',
    status: 'in_progress',
    assignee_name: 'Ada Obi',
    location: 'Pump house',
    transcription: 'The rail moves when you lean on it.',
    report_data: {
      photo_url: '',
      actions_taken: ['Tape off the stair'],
      acknowledged_at: '2026-09-20T10:00:00Z',
      assigned_at: '2026-09-20T11:00:00Z',
      assignment_note: 'Please fix today',
    },
    assigned_to: 'u2',
  },
  {
    id: 'e5f6a7b8-0000-4000-8000-000000000002',
    title: 'Oil drip under pump P-101',
    description: 'Small drip tray overflowing.',
    created_at: '2026-09-18T14:40:00Z',
    severity: 'low',
    status: 'closed',
    location: 'Tank farm',
    root_cause: 'Worn seal',
    corrective_action: 'Seal replaced',
    report_data: { closure_details: { lessonsLearned: 'Check seals monthly' }, closed_at: '2026-09-19T08:00:00Z' },
  },
  {
    id: 'c9d0e1f2-0000-4000-8000-000000000003',
    title: 'Draft about blocked exit',
    description: '',
    created_at: '2026-09-17T08:05:00Z',
    severity: 'medium',
    status: 'draft',
  },
];

/** The Quick Report service; each test sets `qr.analyze` / `qr.submit`. */
export const qr = {
  analyze: async () => ANALYSIS,
  submit: async () => ({ reportId: 'QR-2026-0042', points: 15, streak: 3, ranking: 2 }),
  reports: REPORTS,
};
export const ANALYSIS = {
  reportId: 'QR-2026-0042',
  timestamp: '2026-09-20T09:15:00Z',
  confidence: 87,
  transcription: 'Rail is loose on the stair.',
  usage: { used: 4, quota: 50 },
  combinedAnalysis: {
    description: 'A loose handrail on the stair near the pump house.',
    severity: 'High',
    category: 'Slip/Trip/Fall',
    recommendedActions: ['Tape off the stair'],
  },
};
export const quickReportServiceModule = {
  quickReportService: {
    getAiUsage: async () => ({ used: 3, quota: 50 }),
    analyzeReport: (...args) => qr.analyze(...args),
    submitReport: (...args) => qr.submit(...args),
    getUserReports: async () => qr.reports,
  },
};

export const orgData = { departments: [], sites: [] };
export const orgDataModule = {
  useOrganizationData: () => ({
    getDepartments: async () => orgData.departments,
    getSites: async () => orgData.sites,
  }),
};

export const throttleModule = { requestThrottle: { getStatus: () => ({ queueSize: 0, isProcessing: false }) } };
export const aiAnalysisModule = { cancelAnalysis: () => {}, analyzeQuickReport: async () => ({}), transcribeAudio: async () => '' };

export const SITES = [{ id: 's1', name: 'North Yard', address: '1 Quay Road', latitude: 4.8, longitude: 7.0 }];
export const hseServiceModule = {
  hseService: {
    getSites: async () => SITES,
    checkDuplicates: async () => [{ id: 'd1', reference_code: 'HSE-100200', title: 'Loose handrail on stair A' }],
    createSite: async (s) => ({ id: 's2', ...s }),
    createReport: async () => ({ id: 'r1', reference_code: 'HSE-123456' }),
    createAction: async () => ({}),
  },
};
export const departmentServiceModule = { departmentService: { getActiveDepartments: async () => [{ id: 'dep1', name: 'Operations' }] } };
export const siteServiceModule = { siteService: { reverseGeocode: async () => ({ display_name: '1 Quay Road' }) } };
export const locationServiceModule = { locationService: { getLocations: async () => [] } };
export const siteSearchModule = {
  siteSearchService: {
    searchSites: async (_org, q) => (q.toLowerCase().startsWith('no') ? SITES : []),
  },
};
export const templateServiceModule = { templateService: { getTemplates: async () => [] } };
export const offlineModule = { offlineManager: { saveIncident: async () => {} } };
export const notificationServiceModule = {
  notificationService: { createNotification: async () => {}, notifyAdmins: async () => {} },
};

// react-leaflet stand-in: the map frame, the layer buttons and the hint are
// ours and are checked; the Leaflet internals (tiles, markers, panes) are not
// rendered in jsdom.
export const reactLeafletModule = {
  MapContainer: ({ className, style, children }) => (
    <div data-testid="leaflet-map" className={className} style={style}>{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="leaflet-marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="leaflet-popup">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="leaflet-tooltip">{children}</div>,
  useMap: () => ({ fitBounds() {}, setView() {}, getZoom: () => 6, getCenter: () => ({ lat: 0, lng: 0 }) }),
  useMapEvents: () => ({}),
};

// ---------------------------------------------------------------------------
// Browser APIs jsdom lacks.
export function installReportingShims() {
  if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:mock-object-url';
  if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
}

/** A DOM string with the run-dependent parts (times, ids) taken out. */
export function stableDom(html) {
  return html
    .replace(/radix-:[a-z0-9]+:/gi, 'radix-ID')
    .replace(/:r[a-z0-9]+:/gi, ':rID:')
    .replace(/\[\d{1,2}:\d{2}:\d{2}\]/g, '[TIME]')
    .replace(/Draft saved [^<]*/g, 'Draft saved TIME');
}

const byText = (text) => screen.getByText(text);
const click = (el) => fireEvent.click(el);
const type = (el, value) => fireEvent.change(el, { target: { value } });
const tab = (name) => {
  const el = screen.getByRole('tab', { name });
  fireEvent.mouseDown(el);
  fireEvent.click(el);
};

// ---------------------------------------------------------------------------
// Walk-throughs. Each calls snap(name) at every state worth checking; the
// dialog must already be open.

/** The Quick Report flow from capture to success. */
export async function walkQuickReport(snap) {
  await screen.findByText('Take a Photo');
  await flush();
  snap('capture');

  // the microphone test: idle, then failed (jsdom has no microphone)
  click(byText('Test Mic'));
  await flush();
  snap('micIdle');
  click(byText('Start Test'));
  await screen.findByText('Diagnosis Failed');
  await flush();
  snap('micFailed');
  click(byText('Microphone Diagnostics').closest('div').querySelector('button'));
  await flush();

  // a photo, then the analysis (held open to see the analysing step)
  const input = document.querySelector('input[type="file"][accept="image/*"]');
  fireEvent.change(input, { target: { files: [new File(['x'], 'rail.png', { type: 'image/png' })] } });
  await flush();
  snap('photoReady');

  let release;
  qr.analyze = () => new Promise((resolve) => { release = () => resolve(ANALYSIS); });
  click(byText('Analyze Report'));
  await flush();
  snap('analyzing');
  await act(async () => { release(); });
  await screen.findByText('Safety Observation');
  await flush();
  snap('preview');

  click(byText('Advanced Details (Optional)'));
  await flush();
  snap('previewAdvanced');

  click(byText('Edit'));
  await flush();
  snap('previewEdit');
  click(byText('Cancel'));
  await flush();

  click(byText('Submit Report'));
  await screen.findByText('Report Submitted!');
  await flush();
  snap('success');
}

/** The analysis failing: back to capture with the error banner. */
export async function walkQuickReportError(snap) {
  await screen.findByText('Take a Photo');
  const input = document.querySelector('input[type="file"][accept="image/*"]');
  fireEvent.change(input, { target: { files: [new File(['x'], 'rail.png', { type: 'image/png' })] } });
  qr.analyze = async () => { throw new Error('offline'); };
  click(byText('Analyze Report'));
  await screen.findByText(/AI analysis failed/);
  await flush();
  snap('analysisError');
}

/** The Report Wizard (opened with a type, as a module opens it) from step 1 to review. */
export async function walkReportWizard(snap) {
  await screen.findByText('New HSE Report');
  await flush();
  snap('step1');
  const next = () => click(screen.getByText('Next Step'));

  next();
  await screen.findByText('Map View');
  await flush();
  snap('step2Map');
  // the search tab with no match, the quick-add panel it opens over the map,
  // then a match
  tab(/Search/);
  await screen.findByText('Find Location');
  type(screen.getByPlaceholderText('e.g. Headquarters, Warehouse A...'), 'zz');
  await flush(400);
  snap('step2SearchEmpty');
  click(byText('Create New Site'));
  tab(/Map View/);
  await screen.findByText('Create New Site');
  await flush();
  snap('step2QuickAdd');
  click(byText('Cancel'));
  await flush();
  tab(/Search/);
  await screen.findByText('Find Location');
  const search = screen.getByPlaceholderText('e.g. Headquarters, Warehouse A...');
  type(search, 'North');
  await flush(400);
  snap('step2SearchResults');
  click(byText('1 Quay Road'));
  await flush();
  type(document.querySelector('input[type="datetime-local"]'), '2026-09-01T10:00');
  await flush();
  snap('step2Selected');

  next();
  await flush();
  type(screen.getByPlaceholderText('Brief headline...'), 'Loose handrail on stair B');
  type(screen.getByPlaceholderText('Detailed description...'), 'Bolts missing at the landing.');
  // past the wizard's 2 s draft autosave, so "Draft saved" shows from here on
  // whatever the machine's speed
  await flush(2200);
  snap('step3');

  next();
  await flush();
  click(byText('Working at Height'));
  await flush();
  snap('step4');

  next();
  await flush();
  click(byText('High'));
  await flush();
  snap('step5');

  next();
  await flush();
  snap('step6');

  next();
  await flush();
  const media = document.querySelector('input[type="file"][accept="image/*,video/*"]');
  fireEvent.change(media, { target: { files: [new File(['x'], 'stair.jpg', { type: 'image/jpeg' })] } });
  await flush();
  snap('step7');

  next();
  await flush();
  snap('step8Empty');
  type(screen.getByPlaceholderText('Name'), 'Ada Obi');
  type(screen.getByPlaceholderText('Role (e.g. Witness)'), 'Witness');
  click(document.querySelector('input[placeholder="Company"]').parentElement.querySelector('button'));
  await flush();
  snap('step8');

  next();
  await flush();
  type(screen.getByPlaceholderText('Action Title'), 'Replace bolts');
  click(byText('Add Action'));
  await flush();
  snap('step9');

  next();
  await flush();
  snap('step10');

  click(byText('Submit Report'));
  await flush(120);
}

/** The Upgrade modal, open. */
export async function walkUpgradeModal(snap) {
  await screen.findByText('Upgrade to HSE Premium');
  await flush();
  snap('open');
}
