// @vitest-environment jsdom
// Batch 2D theme test: Settings (module id settings, OrgAdminSettings) in
// the signed-in layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, runs the standard
// four checks on the premium upsell a non-premium admin sees, then walks the
// branding editor (since batch 4A without its theme, colour, typography and
// custom CSS controls: the family look wins), Departments, Compliance and My
// Profile, in light and in dark. Only the data layer is stubbed; no
// request leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome,
} from '@/design/testing/themeAssertions';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
// The branding editor reads the organisation theme context the app root
// provides; the stand-in only records the save.
vi.mock('@/context/GlobalThemeContext', () => ({
  GlobalThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'dark', updateOrgSettings: () => {} }),
}));

vi.mock('@/services/settingsService', () => ({
  settingsService: {
    getOrgSettings: async () => ({
      theme_preset: 'modern',
      logo_url: null,
      branding_config: { colors: { brand: { primary: '#0f4c81', secondary: '#ffffff', accent: '#0f4c81' } } },
    }),
    getBrandingAuditLog: async () => [
      { id: 'l1', action: 'settings_update', timestamp: '2026-09-20T10:00:00Z', performer: { email: 'lead@example.com' }, changes: { primary: '#0f4c81' } },
    ],
    upsertOrgSettings: async () => ({}),
    uploadLogo: async () => '',
  },
}));
vi.mock('@/services/orgSettingsService', () => ({
  orgSettingsService: {
    getUserProfile: async () => ({ full_name: 'Test Lead', job_title: 'HSE Lead', phone_number: '', department_id: null, notification_prefs: { email: true, in_app: true, sms: false } }),
    getActivityLogs: async () => [{ id: 'g1', action: 'Updated Profile', created_at: '2026-09-21T09:00:00Z' }],
    getDepartments: async () => [{ id: 'd1', name: 'Drilling Support' }],
    upsertUserProfile: async () => ({}),
    logActivity: async () => ({}),
    updateUserPassword: async () => ({}),
    uploadAvatar: async () => '',
  },
}));
vi.mock('@/services/complianceService', () => ({
  complianceService: {
    getFrameworks: async () => [
      { name: 'Weekly gas test', severity: 'High', frequency: 'Weekly', responsible: 'Ada Obi', next_due: '2026-10-01' },
    ],
  },
}));

// The layout mounts the whole shell; under a loaded full run the first
// paint can take longer than the library's 1 s default.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
// A non-premium org admin sees the upsell; a super admin gets the editor.
const onSettings = (role = 'org_admin') => resetShell({ activeModule: { id: 'settings', label: 'Settings' }, role });
const ready = async () => { await screen.findByText('Organization Settings'); await screen.findByText(/Premium Feature/); await flush(); };
const readyEditor = async () => { await screen.findByText('Organization Settings'); await screen.findByText('Colors and theme'); await flush(); };

describe('Settings (batch 2D)', () => {
  beforeEach(() => onSettings());

  describeModuleTheme({ name: 'Settings', moduleId: 'settings', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('the premium upsell uses the gold accent button', async () => {
      renderLayout();
      await ready();
      expect(screen.getByRole('button', { name: 'Upgrade to Premium' }).className).toContain('bg-pl-accent');
      expectNoLegacyChrome();
    });

    it('walks the branding editor sections; the theme, colour, typography and custom CSS controls are hidden (4A)', async () => {
      onSettings('super_admin');
      renderLayout();
      await readyEditor();
      expect(screen.getByRole('button', { name: 'Save Changes' }).className).not.toContain('petrolord-button');
      expect(screen.getByText('Colors and theme').closest('[role="alert"]').className).toContain('bg-pl-info-bg');
      expectNoLegacyChrome();

      // hidden: presets, the Colors and Typography tabs, the colour preview
      expect(screen.queryByText('Quick Theme Presets')).toBeNull();
      expect(screen.queryByRole('tab', { name: /^Colors$/ })).toBeNull();
      expect(screen.queryByRole('tab', { name: /^Typography$/ })).toBeNull();
      expect(screen.queryByText('Dashboard Overview')).toBeNull();

      for (const [tab, text] of [
        [/^Login Page$/, 'Login Form Position'], [/^Footer$/, 'Footer Settings'], [/^Advanced$/, 'Change History'],
      ]) {
        await clickTab(tab);
        await screen.findByText(text);
        expectNoLegacyChrome();
      }
      // hidden: the custom CSS editor
      expect(screen.queryByText('Custom CSS')).toBeNull();
    });

    it('walks Departments, Compliance and My Profile on roles', async () => {
      renderLayout();
      await ready();

      await clickTab(/Departments/);
      await screen.findByText('Departments Consolidated');
      expectNoLegacyChrome();

      await clickTab(/Compliance/);
      await screen.findByText('Weekly gas test');
      expectNoLegacyChrome();

      await clickTab(/Profile/);
      await screen.findByText('Personal Information');
      await screen.findByText('Updated Profile');
      expectNoLegacyChrome();
      const select = within(screen.getByText('Department').parentElement).getByRole('combobox');
      fireEvent.pointerDown(select, { button: 0, ctrlKey: false, pointerType: 'mouse' });
      fireEvent.keyDown(select, { key: 'Enter' });
      const listbox = await screen.findByRole('listbox');
      expect(listbox.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, the branding editor and My Profile included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      onSettings('super_admin');
      renderLayout();
      await readyEditor();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await clickTab(/Profile/);
      await screen.findByText('Personal Information');
      expectNoLegacyChrome();
    });
  });
});
