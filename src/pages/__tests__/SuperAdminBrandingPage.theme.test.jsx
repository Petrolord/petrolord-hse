// @vitest-environment jsdom
// Batch 3A theme test: the Branding Manager (/dashboard/super-admin/branding),
// a signed-in page outside the HSE layout that opens its own scope through
// AccountScope with the toggle in its header bar. Covers the organisation
// list, every customizer tab, the select menus and template dialogs (portals
// carry the theme). Batch 4B hid the colour, typography and custom CSS
// controls and the colour preview, as 4A did in Settings, and shows the same
// note. Only the data layer is stubbed.
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

const ORGS = [
  { id: 'o1', name: 'Delta Energy', subscription_tier: 'premium', organization_branding: [{ is_branding_enabled: true }] },
  { id: 'o2', name: 'Niger Basin Ops', subscription_tier: 'free', organization_branding: [] },
];
vi.mock('@/services/superAdminBrandingService', () => ({
  superAdminBrandingService: {
    getAllOrganizations: async () => ORGS,
    getOrganizationBranding: async () => ({
      primary_color: '#0E7C66', secondary_color: '#12202B', accent_color: '#C9A227', text_color: '#FFFFFF',
      background_color: '#0B141B', font_family: 'Inter', font_size_base: 16, border_radius: 'md',
      is_branding_enabled: true, logo_url: null, favicon_url: null, login_page_background: 'custom',
    }),
    getTemplates: async () => ([{ id: 't1', name: 'Offshore dark', branding_config: {} }]),
    updateOrganizationBranding: async () => ({}), bulkUpdateBranding: async () => ({}),
    createTemplate: async () => ({}), uploadAsset: async () => 'https://example.com/logo.png',
  },
}));

const { default: SuperAdminBrandingPage } = await import('@/pages/SuperAdminBrandingPage');

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const SCOPE = 'branding-manager-theme-scope';
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };
const renderPage = async () => {
  render(<MemoryRouter initialEntries={['/dashboard/super-admin/branding']}><SuperAdminBrandingPage /></MemoryRouter>);
  await screen.findByText('Delta Energy');
  await flush();
};
const selectOrg = async () => {
  click(screen.getByText('Delta Energy'));
  await screen.findByText('Branding Customizer');
  await flush();
};
const openTab = async (name) => {
  click(screen.getByRole('tab', { name }));
  await flush();
};

describe('Branding Manager on the design system (batch 3A, AccountScope)', () => {
  beforeAll(installDomShims);
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* storage unavailable */ }
    resetShell();
  });

  it('opens light inside its own scope, with the toggle in the header bar', async () => {
    await renderPage();
    const scope = getScopeRoot(SCOPE);
    expectLightByDefault(scope);
    expect(within(scope).getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Branding Manager' })).toBeInTheDocument();
  });

  it('the header toggle switches to dark and back and stores the choice', async () => {
    await renderPage();
    expectToggleRoundTrip(getScopeRoot(SCOPE));
  });

  it('the organisation list and the empty customizer leave no legacy colour (with a negative control)', async () => {
    await renderPage();
    expect(screen.getByText('No Organization Selected')).toBeInTheDocument();
    expect(screen.getByText('Branded').className).toContain('bg-pl-success-bg');
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot(SCOPE));
  });

  it('every customizer tab is on roles', async () => {
    await renderPage();
    await selectOrg();
    expect(screen.getByText('Branding Status')).toBeInTheDocument();
    expectNoLegacyChrome();
    for (const [tab, marker] of [
      ['Login Page', 'Login Experience'], ['Footer', 'Footer Content'],
    ]) {
      await openTab(tab);
      await screen.findByText(marker);
      expect({ tab, legacy: legacyChromeClasses() }).toEqual({ tab, legacy: [] });
    }
  });

  it('the select menu and the template dialogs carry the theme, in dark', async () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    await renderPage();
    expect(getScopeRoot(SCOPE)).toHaveAttribute('data-pl-theme', 'dark');
    await selectOrg();
    await openTab('Login Page');
    click(screen.getAllByRole('combobox')[0]);
    const listbox = await screen.findByRole('listbox');
    expect(listbox.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
    expectNoLegacyChrome();
    fireEvent.keyDown(listbox, { key: 'Escape' });
    await flush();

    click(screen.getByRole('button', { name: /Load Template/ }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'dark');
    await within(dialog).findByText('Offshore dark');
    expect(legacyChromeClasses()).toEqual([]);
  });

  it('hides the theme, colour, typography and custom CSS controls and the colour preview, with the 4A note (4B)', async () => {
    await renderPage();
    await selectOrg();
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent);
    expect(tabs).toEqual(['Logo & Brand', 'Login Page', 'Footer']);
    expect(screen.queryByText('Live Preview')).toBeNull();
    expect(screen.queryByText('Brand Colors')).toBeNull();
    expect(screen.queryByText('Custom CSS Injection')).toBeNull();
    expect(document.querySelector('[data-canvas="document"]')).toBeNull();
    const note = screen.getByText('Colors and theme').closest('[role="alert"]');
    expect(note.className).toContain('bg-pl-info-bg');
    expect(note).toHaveTextContent('Each person chooses light or dark from the header toggle.');
    expectNoLegacyChrome();
  });
});
