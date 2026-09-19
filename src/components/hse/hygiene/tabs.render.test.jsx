// Render gate: every Occupational Hygiene tab renders its results panel from
// a filled form, and a refusal renders by name, without throwing. A tab that
// crashes on real input would otherwise only show up in the browser.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NoiseTab from './NoiseTab';
import ChemicalTab from './ChemicalTab';
import HeatTab from './HeatTab';
import RecordsTab, { buildRecords } from './RecordsTab';
import { HEAT_EQUATION_NOTE } from './HeatTab';
import * as forms from '@/lib/hygiene/forms';

vi.mock('@/lib/customSupabaseClient', () => ({ supabase: {} }));

const noop = () => {};
const common = { orgId: 'org', sites: [{ id: 's1', name: 'Site A' }], canSave: true, saveBlockReason: null, onSaved: noop, setForm: noop };

const noiseForm = {
  ...forms.blankNoiseForm(),
  subjectLabel: 'Compressor operators',
  shiftHours: '10',
  periods: [{ level: '95', duration: '2' }, { level: '90', duration: '4' }, { level: '100', duration: '1' }],
  protectorMethod: 'NIOSH_TYPE',
  protectorNrr: '30',
};

const chemForm = {
  ...forms.blankChemicalForm(),
  subjectLabel: 'Tank cleaners',
  shiftHours: '12',
  weeklyHours: '60',
  additive: true,
  agents: [
    { ...forms.blankAgent(), agentName: 'A', twaLimit: '1000', limitSource: 'example', periods: [{ concentration: '500', duration: '8' }], stelPeriods: [{ concentration: '300', durationMin: '5' }] },
    { ...forms.blankAgent(), agentName: 'B', twaLimit: '200', limitSource: 'example', periods: [{ concentration: '45', duration: '8' }] },
  ],
};

const heatForm = {
  ...forms.blankHeatForm(),
  subjectLabel: 'Deck crew',
  wbgtPeriods: [
    { durationMin: '45', naturalWetBulbC: '25', globeC: '45', dryBulbC: '32', wbgtC: '' },
    { durationMin: '15', naturalWetBulbC: '22', globeC: '30', dryBulbC: '28', wbgtC: '' },
  ],
  metabolicPeriods: [{ durationMin: '45', metabolicRateW: '400', activity: '' }, { durationMin: '15', metabolicRateW: '120', activity: '' }],
};

const text = (el) => renderToStaticMarkup(el).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Occupational Hygiene tabs render', () => {
  test('noise: all three criteria, LEX, the extended-shift action level and the protector', () => {
    const t = text(<NoiseTab {...common} form={noiseForm} />);
    expect(t).toContain('OSHA PEL');
    expect(t).toContain('OSHA action level');
    expect(t).toContain('NIOSH REL');
    expect(t).toContain('150.0 %'); // the 1910.95 dose
    expect(t).toContain('LEX,8h');
    expect(t).toContain('83.4'); // the 10 h action level
    expect(t).toContain('NIOSH_TYPE');
  });

  test('noise: a refusal is shown by field name', () => {
    const t = text(<NoiseTab {...common} form={{ ...noiseForm, periods: [{ level: '90', duration: '20' }, { level: '85', duration: '5' }] }} />);
    expect(t).toContain('Refused');
    expect(t).toContain('a daily dose covers at most 24 hours');
  });

  test('chemical: TWA, STEL, Brief and Scala and the mixture index', () => {
    const t = text(<ChemicalTab {...common} form={chemForm} />);
    expect(t).toContain('8-hour TWA');
    expect(t).toContain('15-minute STEL');
    expect(t).toContain('Brief and Scala adjusted limit');
    expect(t).toContain('Mixture exposure index');
  });

  test('heat: the assessment and the equation caveat', () => {
    const t = text(<HeatTab {...common} form={heatForm} />);
    expect(t).toContain('Time-weighted WBGT');
    expect(t).toContain('REL at this rate');
    expect(HEAT_EQUATION_NOTE).toMatch(/published NIOSH 2016-106 equations/);
    expect(HEAT_EQUATION_NOTE).toMatch(/worked example/);
    expect(t).toContain('transcription only');
  });

  test('records: stored rows list with recomputed results', () => {
    const noiseRow = { id: 'n1', ...forms.noiseRowFromForm(noiseForm, forms.noiseInputs(noiseForm)) };
    const chemRows = forms.chemicalRowsFromForm(chemForm, forms.chemicalInputs(chemForm));
    const heatRow = { id: 'h1', ...forms.heatRowFromForm(heatForm, forms.heatInputs(heatForm)) };
    const records = { noise: [noiseRow], chemical: chemRows, heat: [heatRow] };
    expect(buildRecords(records)).toHaveLength(3); // the two agents are one sample
    const t = text(<RecordsTab orgId="org" records={records} sites={common.sites} canEdit onOpen={noop} onChanged={noop} />);
    expect(t).toContain('dose 150.0%');
    expect(t).toContain('mixture index');
    expect(t).toContain('WBGT');
  });

  test('no em or en dashes in the module copy', () => {
    const all = [NoiseTab, ChemicalTab, HeatTab].map((C, i) => text(<C {...common} form={[noiseForm, chemForm, heatForm][i]} />)).join(' ');
    expect(all).not.toMatch(/[–—]/);
  });
});
