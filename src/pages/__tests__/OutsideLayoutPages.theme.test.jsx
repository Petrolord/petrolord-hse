// @vitest-environment jsdom
// Batch 3A theme test: the signed-in pages that sit outside the HSE layout
// (/dashboard/upgrade, /dashboard/analytics/advanced, /suite and /auditor)
// open their own scope through AccountScope
// (src/components/account/accountChrome.jsx; docs/scope/DesignSystem-Rollout.md
// section 4.2). Each page: light by default with the toggle in its header,
// the toggle round trip, no legacy chrome (with a negative control), plus
// the page's own states. Only the data layer is stubbed; no request leaves
// the test (the Supabase client is the throwing-free shellMocks stub, and
// the auditor's table read is answered locally). The auth stub provides no
// AuthContext value, so the scope resolves the anonymous key.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  installDomShims, getScopeRoot, expectLightByDefault, expectToggleRoundTrip,
  expectNoLegacyChrome, expectNegativeControl,
} from '@/design/testing/themeAssertions';

const MOMENTS = [
  {
    id: 'm1', title: 'Office Ergonomics', one_minute_recap: 'Set the chair and the screen before you start.',
    key_points: ['Chair height', 'Screen distance'], do_list: ['Take breaks'], incident_scenario: { what: 'Back strain' },
    site_checklist: ['Chair checked'], why_it_matters: 'Posture problems build up slowly.', references: ['HSE DSE guidance'],
  },
  {
    id: 'm2', title: 'Ladder Safety', one_minute_recap: null, key_points: [], do_list: null, incident_scenario: null,
    site_checklist: [], why_it_matters: null, references: [],
  },
];

vi.mock('@/lib/customSupabaseClient', async () => {
  const { supabaseModule } = await import('@/design/testing/shellMocks');
  const table = (name) => {
    const result = { data: name === 'safety_moments' ? MOMENTS : null, error: null };
    const q = { select: () => q, order: () => q, eq: () => q, then: (res, rej) => Promise.resolve(result).then(res, rej) };
    return q;
  };
  return { supabase: { ...supabaseModule.supabase, from: table } };
});
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);

const access = { isOrgAdmin: true, isPremium: false };
vi.mock('@/hooks/useHSEAccess', () => ({ useHSEAccess: () => access }));

const { default: UpgradePage } = await import('@/pages/UpgradePage');
const { default: AdvancedAnalyticsDashboard } = await import('@/components/hse/analytics/AdvancedAnalyticsDashboard');
const { default: SuiteDashboard } = await import('@/components/suite/SuiteDashboard');
const { default: SafetyContentAuditor } = await import('@/components/admin/SafetyContentAuditor');

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };

const PAGES = [
  {
    name: 'Upgrade', path: '/dashboard/upgrade', scope: 'upgrade-theme-scope', Page: UpgradePage,
    ready: () => screen.findByRole('heading', { level: 1, name: 'Upgrade to HSE Professional' }),
  },
  {
    name: 'Advanced Analytics', path: '/dashboard/analytics/advanced', scope: 'advanced-analytics-theme-scope', Page: AdvancedAnalyticsDashboard,
    ready: () => screen.findByRole('heading', { level: 1, name: 'Advanced Analytics' }),
  },
  {
    name: 'Suite', path: '/suite', scope: 'suite-dashboard-theme-scope', Page: SuiteDashboard,
    ready: () => screen.findByRole('heading', { level: 1, name: 'Petrolord Suite' }),
  },
  {
    name: 'Safety Content Auditor', path: '/auditor', scope: 'safety-content-auditor-theme-scope', Page: SafetyContentAuditor,
    ready: async () => { await screen.findByText('Ladder Safety'); await flush(); },
  },
];

const mount = async ({ path, Page, ready }) => {
  render(<MemoryRouter initialEntries={[path]}><Page /></MemoryRouter>);
  await ready();
};

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  resetShell();
  access.isOrgAdmin = true;
  access.isPremium = false;
});

describe.each(PAGES)('$name ($path) on the design system (batch 3A, AccountScope)', (page) => {
  it('opens light inside its own scope, with the toggle in the page header', async () => {
    await mount(page);
    const scope = getScopeRoot(page.scope);
    expectLightByDefault(scope);
    expect(within(scope.querySelector('header')).getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('the header toggle switches to dark and back and stores the choice', async () => {
    await mount(page);
    expectToggleRoundTrip(getScopeRoot(page.scope));
  });

  it('leaves no legacy colour (with a negative control)', async () => {
    await mount(page);
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot(page.scope));
  });

  it('a returning dark user opens dark', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    await mount(page);
    expect(getScopeRoot(page.scope)).toHaveAttribute('data-pl-theme', 'dark');
    expectNoLegacyChrome();
  });
});

describe('page states (batch 3A)', () => {
  it('Upgrade: the selected term and band read as selected, prices in mono figures', async () => {
    await mount(PAGES[0]);
    const annual = screen.getByRole('button', { name: /Annual/ });
    expect(annual).toHaveAttribute('aria-pressed', 'true');
    expect(annual.className).toContain('border-pl-primary');
    click(screen.getByRole('button', { name: /Monthly/ }));
    expect(screen.getByRole('button', { name: /Monthly/ })).toHaveAttribute('aria-pressed', 'true');
    click(screen.getByRole('radio', { name: '11-50 users' }));
    expect(screen.getByRole('radio', { name: '11-50 users' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('$275').className).toContain('tabular-nums');
    expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('Upgrade: the non-admin notice and the already-Professional callout are themed', async () => {
    access.isOrgAdmin = false;
    access.isPremium = true;
    await mount(PAGES[0]);
    expect(screen.getByText(/Only an organization admin can upgrade the plan/)).toBeInTheDocument();
    expect(screen.getByText(/already has Professional access/).className).toContain('bg-pl-success-bg');
    expectNoLegacyChrome();
  });

  it('Suite: open modules and locked modules, with the upgrade word on a neutral badge', async () => {
    await mount(PAGES[2]);
    expect(screen.getByText('HSE Management')).toBeInTheDocument();
    expect(screen.getAllByText('Not Subscribed').length).toBe(6);
    expect(screen.getAllByText('Upgrade')[0].className).toContain('bg-pl-sunken');
    expect(screen.getByRole('button', { name: 'Enter Module' })).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('Auditor: completeness as words on status badges, and an expanded row themed in dark', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    await mount(PAGES[3]);
    expect(screen.getByText('Complete').className).toContain('bg-pl-success-bg');
    expect(screen.getByText('Incomplete').className).toContain('bg-pl-danger-bg');
    expect(screen.getByText('Target')).toBeInTheDocument();
    click(screen.getByText('Office Ergonomics'));
    await screen.findByText('Why It Matters');
    expect(screen.getByText('Posture problems build up slowly.')).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaAlias = await import('@/lib/customSupabaseClient');
    const viaRelative = await import('../../lib/customSupabaseClient');
    expect(viaRelative.supabase).toBe(viaAlias.supabase);
  });
});
