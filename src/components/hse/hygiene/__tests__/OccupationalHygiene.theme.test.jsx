// @vitest-environment jsdom
// Batch 2B theme test: Occupational Hygiene (module id occupational-hygiene)
// in the signed-in layout (docs/scope/DesignSystem-Rollout.md section 8.2).
//
// It mounts the real PetrolordHSE layout on the module, then walks its
// states: the blank noise calculator with its refusal, the records register,
// each stored record opened into its calculator (results, Exceeds and Within
// flags, the white chart panels), the delete confirmation (a portal), the
// read-only notice and the schema-missing notice, in light and in dark. Only
// the data layer is stubbed; no request leaves the test.
import React from 'react';
import { render, screen, fireEvent, act, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resetShell } from '@/design/testing/shellMocks';
import {
  describeModuleTheme, installDomShims, getScopeRoot, expectNoLegacyChrome,
} from '@/design/testing/themeAssertions';
import * as forms from '@/lib/hygiene/forms';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

// Stored rows built through the module's own form layer (the render gate's
// fixtures), so opening a record fills every results panel.
const noiseForm = {
  ...forms.blankNoiseForm(),
  subjectLabel: 'Compressor operators', sampleDate: '2026-09-10', siteId: 's1', shiftHours: '10',
  periods: [{ level: '95', duration: '2' }, { level: '90', duration: '4' }, { level: '100', duration: '1' }],
  protectorMethod: 'NIOSH_TYPE', protectorNrr: '30',
};
const chemForm = {
  ...forms.blankChemicalForm(),
  subjectLabel: 'Tank cleaners', sampleDate: '2026-09-12', shiftHours: '12', weeklyHours: '60', additive: true,
  agents: [
    { ...forms.blankAgent(), agentName: 'Toluene', twaLimit: '1000', limitSource: 'example', periods: [{ concentration: '500', duration: '8' }], stelPeriods: [{ concentration: '300', durationMin: '5' }] },
    { ...forms.blankAgent(), agentName: 'Xylene', twaLimit: '200', limitSource: 'example', periods: [{ concentration: '45', duration: '8' }] },
  ],
};
const heatForm = {
  ...forms.blankHeatForm(),
  subjectLabel: 'Deck crew', assessmentDate: '2026-09-14',
  wbgtPeriods: [
    { durationMin: '45', naturalWetBulbC: '25', globeC: '45', dryBulbC: '32', wbgtC: '' },
    { durationMin: '15', naturalWetBulbC: '22', globeC: '30', dryBulbC: '28', wbgtC: '' },
  ],
  metabolicPeriods: [{ durationMin: '45', metabolicRateW: '400', activity: '' }, { durationMin: '15', metabolicRateW: '120', activity: '' }],
};
const RECORDS = {
  noise: [{ id: 'n1', ...forms.noiseRowFromForm(noiseForm, forms.noiseInputs(noiseForm)) }],
  chemical: forms.chemicalRowsFromForm(chemForm, forms.chemicalInputs(chemForm)).map((r, i) => ({ ...r, id: r.id || `c${i}` })),
  heat: [{ id: 'h1', ...forms.heatRowFromForm(heatForm, forms.heatInputs(heatForm)) }],
};
const SITES = [{ id: 's1', name: 'Compressor house', is_active: true }];

const data = { missing: false };
const missingError = { code: '42P01', message: 'missing' };
const listOf = (kind) => async () => (data.missing ? { data: [], error: missingError } : { data: RECORDS[kind], error: null });
vi.mock('@/services/hygieneService', () => ({
  isSchemaMissing: (e) => !!e && e.code === '42P01',
  describeSaveError: (e) => e.message,
  HYGIENE_TABLES: {},
  hygieneService: {
    listNoise: listOf('noise'),
    listChemical: listOf('chemical'),
    listHeat: listOf('heat'),
    getSites: async () => ({ data: SITES, error: null }),
    saveNoise: async () => ({ data: null, error: null }),
    saveHeat: async () => ({ data: null, error: null }),
    saveChemicalSample: async () => ({ data: null, error: null }),
    remove: async () => ({ error: null }),
  },
}));

// The multi-tab walks mount the whole layout several times; give them room
// on a loaded runner.
vi.setConfig({ testTimeout: 30000 });
configure({ asyncUtilTimeout: 8000 });

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });
const ready = async () => {
  await screen.findByText('Noise sample');
  await flush();
};
const clickTab = async (name) => {
  const tab = screen.getByRole('tab', { name });
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  await flush();
};
const openRecord = async (subject) => {
  await clickTab(/Records/);
  const row = (await screen.findByText(subject)).closest('tr');
  fireEvent.click(within(row).getByRole('button', { name: 'Open' }));
  await flush();
};

describe('Occupational Hygiene', () => {
  beforeEach(() => {
    resetShell({ activeModule: { id: 'occupational-hygiene', label: 'Occupational Hygiene' } });
    data.missing = false;
  });

  describeModuleTheme({ name: 'Occupational Hygiene', moduleId: 'occupational-hygiene', renderApp: renderLayout, ready });

  describe('further states', () => {
    beforeAll(installDomShims);
    beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

    it('lists the records with their flags as status words', async () => {
      renderLayout();
      await ready();
      await clickTab(/Records/);
      await screen.findByText('Compressor operators');
      expect(screen.getByText('3 of 3 records. Results are recomputed from the stored measurements every time.')).toBeInTheDocument();
      const exceeds = screen.getAllByText('Exceeds')[0];
      expect(exceeds.className).toContain('text-pl-danger-text');
      expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
      expectNoLegacyChrome();
    });

    it('opens a noise record into its results and the white chart panel', async () => {
      renderLayout();
      await ready();
      await openRecord('Compressor operators');
      await screen.findByText('Dose and TWA, by criterion');
      expect(screen.getByText('Dose contribution by period').closest('[data-canvas]')).toHaveAttribute('data-canvas', 'chart');
      expect(screen.getByText('Editing a saved record').className).toContain('text-pl-info-text');
      expectNoLegacyChrome();
    });

    it('opens a chemical sample with the mixture index on roles', async () => {
      renderLayout();
      await ready();
      await openRecord('Tank cleaners');
      await screen.findByText('Mixture exposure index');
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('opens a heat assessment with the limit caveat on the warning role', async () => {
      renderLayout();
      await ready();
      await openRecord('Deck crew');
      await screen.findByText('NIOSH assessment');
      expect(screen.getByText('About these limits').closest('div.rounded-lg').className).toContain('bg-pl-warning-bg');
      expectNoLegacyChrome();
    });

    it('confirms a delete in a scoped dialog', async () => {
      renderLayout();
      await ready();
      await clickTab(/Records/);
      const row = (await screen.findByText('Deck crew')).closest('tr');
      fireEvent.click(within(row).getByRole('button', { name: 'Delete' }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
      expect(within(dialog).getByText('Delete this record?')).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('tells a reader the calculators work without saving', async () => {
      resetShell({ activeModule: { id: 'occupational-hygiene', label: 'Occupational Hygiene' }, role: 'employee' });
      renderLayout();
      await ready();
      expect(screen.getByText(/You can use the calculators here/)).toBeInTheDocument();
      expectNoLegacyChrome();
    });

    it('says plainly when the schema is missing', async () => {
      data.missing = true;
      renderLayout();
      await screen.findByText('Hygiene records are not switched on yet');
      expectNoLegacyChrome();
    });

    it('stays clean in dark, an opened record included', async () => {
      window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
      renderLayout();
      await ready();
      expect(getScopeRoot()).toHaveAttribute('data-pl-theme', 'dark');
      expectNoLegacyChrome();
      await openRecord('Compressor operators');
      await screen.findByText('Dose and TWA, by criterion');
      expectNoLegacyChrome();
    });
  });
});
