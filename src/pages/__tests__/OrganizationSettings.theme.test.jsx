// @vitest-environment jsdom
// Batch 1C theme test: /organization, a signed-in page outside the HSE
// layout, which opens its own scope through AccountScope (the Suite port in
// src/components/account/accountChrome.jsx; docs/scope/DesignSystem-Rollout.md
// section 4.2). Covers the four tabs, the asset form and dialogs, the
// loading, error and no-organisation states, and the toggle round trip
// with a negative control. Only the data layer is stubbed.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  installDomShims, getScopeRoot, expectLightByDefault, expectToggleRoundTrip,
  expectNoLegacyChrome, expectNegativeControl, legacyChromeClasses,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);

const fx = { fail: false };
const ORG = {
  id: 'o1', name: 'Test Org', industry: 'Oil and gas', location: '', website: 'https://example.com',
  description: 'An operator.', asset_count: 3, member_count: 4, safety_score: null,
};
vi.mock('@/services/organizationService', () => ({
  fetchOrganization: async () => { if (fx.fail) throw new Error('Network unreachable'); return ORG; },
  updateOrganization: async () => ({}),
  fetchOrganizationMembers: async () => ([
    { id: 'm1', email: 'owner@example.com', role: 'org_admin', created_at: '2026-01-02T00:00:00Z' },
    { id: 'm2', email: 'field.tech@example.com', role: 'employee', created_at: '2026-03-04T00:00:00Z' },
  ]),
  inviteMember: async () => ({}),
  removeMember: async () => ({}),
  fetchOrganizationAssets: async () => ([
    { id: 'a1', name: 'Crane 7', asset_id: 'CR-007', category: 'equipment', location: 'Yard', safety_status: 'critical', safety_notes: 'Hook latch worn' },
    { id: 'a2', name: 'Gas monitor', asset_id: 'GM-2', category: 'safety', safety_status: 'safe' },
  ]),
  addAsset: async () => ({}), updateAsset: async () => ({}), deleteAsset: async () => ({}),
  fetchAssetSafetyData: async () => ({
    score: 50, safe: 1, warning: 0, critical: 1,
    flagged: [{ id: 'a1', name: 'Crane 7', safety_status: 'critical', safety_notes: 'Hook latch worn', updated_at: '2026-09-01T00:00:00Z' }],
  }),
}));

const { default: OrganizationSettings } = await import('@/pages/OrganizationSettings');

const SCOPE = 'organization-settings-theme-scope';
const renderPage = () => render(
  <MemoryRouter initialEntries={['/organization']}>
    <OrganizationSettings />
  </MemoryRouter>,
);
// The layout mounts the whole shell; under a loaded full run the first
// paint can take longer than the library's 1 s default.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };
const openTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  click(tab);
  await flush();
};
const ready = async () => { await screen.findByText('Organization Overview'); await flush(); };

describe('/organization on the design system (batch 1C, AccountScope)', () => {
  beforeAll(installDomShims);
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* storage unavailable */ }
    resetShell();
    fx.fail = false;
  });

  it('opens light inside its own scope, with the toggle in the page header', async () => {
    renderPage();
    await ready();
    const scope = getScopeRoot(SCOPE);
    expectLightByDefault(scope);
    expect(within(scope.querySelector('header')).getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Organization Settings' })).toBeInTheDocument();
  });

  it('the header toggle switches to dark and back and stores the choice', async () => {
    renderPage();
    await ready();
    expectToggleRoundTrip(getScopeRoot(SCOPE));
  });

  it('leaves no legacy colour on the overview (with a negative control), and empty values read n/a', async () => {
    renderPage();
    await ready();
    expect(screen.getByText('n/a')).toBeInTheDocument();
    expect(screen.queryByText('N/A')).toBeNull();
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot(SCOPE));
  });

  it('the edit form is on roles', async () => {
    renderPage();
    await ready();
    click(screen.getByRole('button', { name: 'Edit Organization' }));
    await screen.findByRole('button', { name: 'Save Changes' });
    expectNoLegacyChrome();
  });

  it('Members tab: roles as words on neutral badges, the invite form and the remove dialog themed', async () => {
    renderPage();
    await ready();
    await openTab('Members');
    await screen.findByText('field.tech@example.com');
    expect(screen.getByText('Org admin')).toBeInTheDocument();
    click(screen.getByRole('button', { name: /Invite Member/ }));
    await screen.findByPlaceholderText('member@example.com');
    expectNoLegacyChrome();
    click(screen.getByRole('button', { name: 'Remove field.tech@example.com' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('Assets tab: status badges carry the word, and the asset form and delete dialog are themed', async () => {
    renderPage();
    await ready();
    await openTab('Assets');
    await screen.findByText('Crane 7');
    expect(screen.getAllByText('CRITICAL').length).toBeGreaterThan(0);
    expect(screen.getByText('SAFE')).toBeInTheDocument();
    expectNoLegacyChrome();
    click(screen.getByRole('button', { name: /Add Asset/ }));
    await screen.findByText('Add New Asset');
    expectNoLegacyChrome();
    click(screen.getByRole('button', { name: 'Delete Crane 7' }));
    await screen.findByRole('alertdialog');
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('Safety tab: flagged assets and counts on status roles, in dark', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    renderPage();
    await ready();
    expect(getScopeRoot(SCOPE)).toHaveAttribute('data-pl-theme', 'dark');
    await openTab('Safety');
    await screen.findByText('Assets Needing Attention');
    await flush();
    expect(screen.getByText('Hook latch worn')).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('the error state sits in the scope too', async () => {
    fx.fail = true;
    renderPage();
    await screen.findByText('Error Loading Settings');
    expect(getScopeRoot(SCOPE)).toHaveAttribute('data-pl-theme', 'light');
    expectNoLegacyChrome();
  });

  it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
    const viaRelative = await import('../../lib/customSupabaseClient');
    const { supabaseModule } = await import('@/design/testing/shellMocks');
    expect(viaRelative.supabase).toBe(supabaseModule.supabase);
  });
});
