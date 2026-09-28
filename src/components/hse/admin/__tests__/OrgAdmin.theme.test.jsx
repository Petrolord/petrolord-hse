// @vitest-environment jsdom
// Batch 1C theme test: the organisation admin modules (Setup Hub, Sites,
// Departments) in the signed-in layout (docs/scope/DesignSystem-Rollout.md
// section 8.2). It mounts the real PetrolordHSE layout with the real
// MainContent, so the checks cover the shell around each module too. Only
// the data layer is stubbed; nothing reaches the network.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome, legacyChromeClasses,
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
// jsdom has no canvas; the QR code renders as a plain element here.
vi.mock('qrcode.react', () => ({ QRCodeCanvas: (props) => <canvas data-testid="qr-canvas" id={props.id} /> }));

const data = {
  status: { siteCount: 2, departmentCount: 0, memberCount: 1, pendingInviteCount: 0, setupComplete: false },
  sites: [
    {
      id: 's1', name: 'Refinery Block A', site_type: 'plant', address: 'Port Harcourt', description: 'Main refinery',
      contact_person: 'Ada Obi', contact_email: 'ada@example.com', is_primary: true, qr_token: 'tok1', qr_enabled: true,
    },
    { id: 's2', name: 'Depot 3', site_type: null, address: '', contact_person: '', is_primary: false, qr_token: 'tok2', qr_enabled: false },
  ],
  departments: [
    { id: 'd1', name: 'Drilling Support', description: 'Field operations', cost_center: 'CC-100', manager_name: 'Tunde' },
    { id: 'd2', name: 'Maintenance Crew' },
  ],
};

vi.mock('@/services/orgAdminService', () => ({
  orgAdminService: {
    getSetupStatus: async () => ({ data: data.status }),
    completeOrgSetup: async () => ({ error: null }),
    listSites: async () => ({ data: data.sites }),
    listDepartments: async () => ({ data: data.departments }),
  },
}));

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

// The layout mounts the whole shell; under a loaded full run the first
// paint can take longer than the library's 1 s default.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const on = (id, label) => resetShell({ activeModule: { id, label } });
const click = (el) => { fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.click(el); };

describe('Organisation admin (batch 1C)', () => {
  describe('Setup Hub', () => {
    beforeEach(() => on('admin-setup-hub', 'Setup Hub'));
    describeModuleTheme({
      name: 'Setup Hub',
      moduleId: 'admin-setup-hub',
      renderApp: renderLayout,
      ready: async () => { await screen.findByText('Get started in 3 quick steps'); await flush(); },
    });
  });

  describe('Sites', () => {
    beforeEach(() => on('admin-sites', 'Sites'));
    describeModuleTheme({
      name: 'Sites',
      moduleId: 'admin-sites',
      renderApp: renderLayout,
      ready: async () => { await screen.findByText('Refinery Block A'); await flush(); },
    });
  });

  describe('Departments', () => {
    beforeEach(() => on('admin-departments', 'Departments'));
    describeModuleTheme({
      name: 'Departments',
      moduleId: 'admin-departments',
      renderApp: renderLayout,
      ready: async () => { await screen.findByText('Drilling Support'); await flush(); },
    });
  });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });
    afterEach(() => {
      data.status = { siteCount: 2, departmentCount: 0, memberCount: 1, pendingInviteCount: 0, setupComplete: false };
    });

    it('Setup Hub: state is shown with a word beside the colour, and the complete banner is on roles', async () => {
      on('admin-setup-hub', 'Setup Hub');
      renderLayout();
      await screen.findByText('Get started in 3 quick steps');
      await flush();
      expect(screen.getAllByText('Done')).toHaveLength(1);
      expect(screen.getAllByText('To do')).toHaveLength(2);
      expect(screen.queryByText(/—/)).toBeNull();
      expectNoLegacyChrome();
    });

    it('Setup Hub: the setup-complete banner, in dark', async () => {
      data.status = { siteCount: 1, departmentCount: 1, memberCount: 3, pendingInviteCount: 0, setupComplete: true };
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      on('admin-setup-hub', 'Setup Hub');
      renderLayout();
      await screen.findByText('Setup is complete');
      await flush();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
    });

    it('Sites: rows show n/a for empty cells and a Primary word beside the star', async () => {
      on('admin-sites', 'Sites');
      renderLayout();
      await screen.findByText('Depot 3');
      const row = screen.getByText('Depot 3').closest('tr');
      expect(within(row).getAllByText('n/a').length).toBe(3);
      expect(within(screen.getByText('Refinery Block A').closest('tr')).getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Refinery Block A').closest('.overflow-x-auto')).not.toBeNull();
      expectNoLegacyChrome();
    });

    it('Sites: the add dialog (with the site type menu open) is themed, portals included', async () => {
      on('admin-sites', 'Sites');
      renderLayout();
      await screen.findByText('Refinery Block A');
      click(screen.getByRole('button', { name: /Add Site/ }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Mark as primary site')).toBeInTheDocument();
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      click(within(dialog).getByRole('combobox'));
      await screen.findByRole('option', { name: 'Plant / Refinery' });
      expect(legacyChromeClasses()).toEqual([]);
    });

    it('Sites: the QR dialog keeps the code on a white light canvas and shows the disabled state in words', async () => {
      on('admin-sites', 'Sites');
      renderLayout();
      await screen.findByText('Depot 3');
      click(screen.getByRole('button', { name: 'Show QR code for Depot 3' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByTestId('qr-canvas').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'light');
      expect(within(dialog).getByText(/QR submissions are currently disabled/)).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Enable submissions' })).toBeInTheDocument();
      click(within(dialog).getByRole('button', { name: /Regenerate code/ }));
      await within(dialog).findByText(/Every previously printed poster/);
      expectNoLegacyChrome();
    });

    it('Sites: the delete confirmation is themed', async () => {
      on('admin-sites', 'Sites');
      renderLayout();
      await screen.findByText('Depot 3');
      click(screen.getByRole('button', { name: 'Delete Depot 3' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Delete this site?')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('Sites: the empty state is on roles', async () => {
      const keep = data.sites;
      data.sites = [];
      try {
        on('admin-sites', 'Sites');
        renderLayout();
        await screen.findByText('No sites yet');
        expectNoLegacyChrome();
      } finally {
        data.sites = keep;
      }
    });

    it('Departments: n/a for empty cells, and the add and remove dialogs are themed', async () => {
      on('admin-departments', 'Departments');
      renderLayout();
      await screen.findByText('Maintenance Crew');
      const row = screen.getByText('Maintenance Crew').closest('tr');
      expect(within(row).getAllByText('n/a')).toHaveLength(2);
      click(screen.getByRole('button', { name: /Add Department/ }));
      let dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Create a new department.')).toBeInTheDocument();
      expectNoLegacyChrome();
      fireEvent.keyDown(dialog, { key: 'Escape' });
      click(screen.getByRole('button', { name: 'Remove Maintenance Crew' }));
      dialog = await screen.findByText('Remove this department?');
      expectNoLegacyChrome();
    });

    it('never reaches the network: relative imports of the Supabase client get the stub too', async () => {
      const viaRelative = await import('../../../../lib/customSupabaseClient');
      const { supabaseModule } = await import('@/design/testing/shellMocks');
      expect(viaRelative.supabase).toBe(supabaseModule.supabase);
    });
  });
});
