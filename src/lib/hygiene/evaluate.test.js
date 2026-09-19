// HS2 data-shaping layer: entered form values in, engine results out.
//
// Every check below starts from the strings a user would type, goes through
// forms.js and evaluate.js and so THROUGH THE VENDORED ENGINE, and must land
// on a figure the vendored golden file carries (published values where the
// source prints one). Nothing here restates a formula.
//
// Each golden check is written against an `impl` (the parsing and evaluation
// functions), so the same check can be run against a deliberately broken
// impl: the planted-defect negatives at the bottom prove each check can tell
// a right layer from a plausibly wrong one.

import fs from 'node:fs';
import path from 'node:path';
import * as forms from './forms';
import * as evaluate from './evaluate';
import { mixtureExposureIndex, hearingProtectorEstimate, NOISE_CRITERIA } from '@/lib/engines/exposure';

const GOLDEN = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../../../packages/engines/test-data/hse/goldens/exposure_cases.json'), 'utf8',
));
const golden = (id) => {
  const c = GOLDEN.cases.find((x) => x.id === id);
  if (!c) throw new Error(`golden ${id} is missing`);
  return c;
};
const at = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[/^\d+$/.test(k) ? Number(k) : k]), obj);
const near = (a, b, tol = 1e-9) => typeof a === 'number' && Math.abs(a - b) <= Math.max(tol, tol * Math.abs(b));

const REAL = { ...forms, ...evaluate };

const noiseForm = (rows, unit = 'h', extra = {}) => ({
  ...forms.blankNoiseForm(),
  subjectLabel: 'Test group',
  durationUnit: unit,
  periods: rows.map(([level, duration]) => ({ level: String(level), duration: String(duration) })),
  ...extra,
});

const agent = (name, rows, extra = {}) => ({
  ...forms.blankAgent(),
  agentName: name,
  periods: rows.map(([c, d]) => ({ concentration: String(c), duration: String(d) })),
  ...extra,
});

/* ------------------------------------------------------------------ */
/* The golden checks, each a function of an impl. true = matches.      */
/* ------------------------------------------------------------------ */

const CHECKS = {
  // 29 CFR 1910.95 App. A: 2 h at 95, 4 h at 90, 1 h at 100 is a 150% dose.
  // Entered in MINUTES so the unit conversion is on the path.
  cfr1910_95_dose: (impl) => {
    const g = golden('dose-mixed-pel');
    const inputs = impl.noiseInputs(noiseForm([[95, 120], [90, 240], [100, 60]], 'min'));
    if (inputs.error) return false;
    const r = impl.evaluateNoise(inputs).criteria.find((c) => c.id === 'OSHA_PEL').result;
    return near(r.dosePct, g.published.dosePct.value) && near(r.twaDbA, g.expect.twaDbA) && r.exceedsLimit === g.expect.exceedsLimit;
  },

  // 29 CFR 1910.1000(d)(1): 150 ppm 2 h, 75 ppm 2 h, 50 ppm 4 h gives 81.25 ppm.
  cfr1910_1000_twa: (impl) => {
    const g = golden('cfr-1000-d1-example');
    const f = { ...forms.blankChemicalForm(), subjectLabel: 'x', agents: [agent('Example', [[150, 2], [75, 2], [50, 4]])] };
    const inputs = impl.chemicalInputs(f);
    if (inputs.error) return false;
    const ev = impl.evaluateChemicalAgent(inputs.agents[0], inputs.schedule);
    return near(ev.twa.twa8h, g.published.twa8h.value);
  },

  // 29 CFR 1910.1000(d)(2): 500/1000 + 45/200 + 40/200 = 0.925, not exceeded.
  cfr1910_1000_mixture: (impl) => {
    const g = golden('cfr-1000-d2-example');
    const f = {
      ...forms.blankChemicalForm(),
      subjectLabel: 'x',
      additive: true,
      agents: [
        agent('A', [[500, 8]], { twaLimit: '1000', limitSource: '1910.1000 example' }),
        agent('B', [[45, 8]], { twaLimit: '200', limitSource: '1910.1000 example' }),
        agent('C', [[40, 8]], { twaLimit: '200', limitSource: '1910.1000 example' }),
      ],
    };
    const inputs = impl.chemicalInputs(f);
    if (inputs.error) return false;
    const evs = inputs.agents.map((a) => impl.evaluateChemicalAgent(a, inputs.schedule));
    const m = impl.evaluateMixture(inputs.agents, evs);
    return !!m.result && near(m.result.index, g.published.index.value) && m.result.exceeds === g.expect.exceeds
      && g.expect['terms.1'] === m.result.terms[1];
  },

  // HSE L108 App. 3 Fig. 26: 80 dB 5 h, 86 dB 2 h, 95 dB 45 min: 145 points, 87 dB(A).
  l108_exposure_points: (impl) => {
    const g = golden('l108-figure-26');
    const inputs = impl.noiseInputs(noiseForm([[80, 300], [86, 120], [95, 45]], 'min'));
    if (inputs.error) return false;
    const lex = impl.evaluateNoise(inputs).lex;
    return Object.entries(g.expect).every(([k, v]) => (typeof v === 'number' ? near(at(lex, k), v) : at(lex, k) === v))
      && Object.entries(g.published || {}).every(([k, { value, tolerance }]) => Math.abs(at(lex, k) - value) <= tolerance);
  },

  // OSHA Technical Manual extended shift action level, 10 h: 83.4 dBA.
  otm_extended_shift: (impl) => {
    const g = golden('otm-al-extended');
    const inputs = impl.noiseInputs(noiseForm([[85, 10]], 'h', { shiftHours: '10' }));
    if (inputs.error) return false;
    const al = impl.evaluateNoise(inputs).shiftActionLevel;
    return near(al.actionLevelDbA, g.expect.actionLevelDbA) && Math.abs(al.actionLevelDbA - g.published.actionLevelDbA.value) <= g.published.actionLevelDbA.tolerance;
  },

  // 1910.95 App. B on C-weighted data: 100 dBC minus NRR 29 = 71.
  appB_c_weighted: (impl) => {
    const g = golden('appB-c-weighted');
    const inputs = impl.noiseInputs(noiseForm([[100, 8]], 'h', {
      protectorMethod: 'OSHA_APPENDIX_B', protectorNrr: '29', protectorWeighting: 'C', protectorCLevel: '100',
    }));
    if (inputs.error) return false;
    const p = impl.evaluateNoise(inputs).protector;
    return near(p.result.protectedDbA, g.expect.protectedDbA) && near(p.result.attenuationDb, g.expect.attenuationDb);
  },

  // OTM App. E: 98 dBA, NRR 25, 50% derating: 89 dBA. The layer feeds the PEL
  // TWA of a steady 98 dBA over 8 h, which the printed 16.61 puts at 98.0002
  // dBA (FINDINGS J1), so this is checked to 1e-3 dB.
  otm_field_50: (impl) => {
    const g = golden('otm-appE-field-50');
    const inputs = impl.noiseInputs(noiseForm([[98, 8]], 'h', { protectorMethod: 'OSHA_FIELD_50', protectorNrr: '25' }));
    if (inputs.error) return false;
    const p = impl.evaluateNoise(inputs).protector;
    return Math.abs(p.result.protectedDbA - g.published.protectedDbA.value) <= 1e-3;
  },

  // Brief and Scala: 12 h a day, 60 h a week, limit 10: the daily 0.5 governs, 5.
  brief_scala_daily: (impl) => {
    const g = golden('esta-glycol-12h');
    const f = {
      ...forms.blankChemicalForm(), subjectLabel: 'x', shiftHours: '12', weeklyHours: '60',
      agents: [agent('Glycol', [[4, 12]], { units: 'mg/m3', twaLimit: '10', limitSource: 'ESTA note' })],
    };
    const inputs = impl.chemicalInputs(f);
    if (inputs.error) return false;
    const bs = impl.evaluateChemicalAgent(inputs.agents[0], inputs.schedule).briefScala;
    return near(bs.result.adjustedLimit, g.published.adjustedLimit.value) && bs.result.governingBasis === g.expect.governingBasis;
  },

  // the smaller factor governs: 10 h a day, 70 h a week, limit 100: weekly, 43.75
  brief_scala_weekly: (impl) => {
    const g = golden('bs-weekly-governs');
    const f = {
      ...forms.blankChemicalForm(), subjectLabel: 'x', shiftHours: '10', weeklyHours: '70',
      agents: [agent('X', [[10, 10]], { twaLimit: '100', limitSource: 'test' })],
    };
    const inputs = impl.chemicalInputs(f);
    if (inputs.error) return false;
    const bs = impl.evaluateChemicalAgent(inputs.agents[0], inputs.schedule).briefScala;
    return near(bs.result.adjustedLimit, g.expect.adjustedLimit) && bs.result.governingBasis === g.expect.governingBasis;
  },

  stel: (impl) => {
    const g = golden('stel-15');
    const f = {
      ...forms.blankChemicalForm(), subjectLabel: 'x',
      agents: [agent('X', [[1, 8]], { stelPeriods: [{ concentration: '300', durationMin: '5' }, { concentration: '120', durationMin: '10' }] })],
    };
    const inputs = impl.chemicalInputs(f);
    if (inputs.error) return false;
    return near(impl.evaluateChemicalAgent(inputs.agents[0], inputs.schedule).stel.stel15Min, g.expect.stel15Min);
  },

  // NIOSH heat, acclimatized (REL) and not (RAL), 45 min at 31 C / 400 W and
  // 15 min at 24 C / 120 W, entered as measured WBGT.
  heat_rel: (impl) => {
    const g = golden('heat-assessment-rel');
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'measured', acclimatized: true,
      wbgtPeriods: [{ durationMin: '45', wbgtC: '31' }, { durationMin: '15', wbgtC: '24' }],
      metabolicPeriods: [{ durationMin: '45', metabolicRateW: '400' }, { durationMin: '15', metabolicRateW: '120' }],
    };
    const inputs = impl.heatInputs(f);
    if (inputs.error) return false;
    const a = impl.evaluateHeat(inputs).assessment;
    return Object.entries(g.expect).every(([k, v]) => (typeof v === 'number' ? near(a[k], v) : a[k] === v));
  },

  heat_ral: (impl) => {
    const g = golden('heat-assessment-ral');
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'measured', acclimatized: false,
      wbgtPeriods: [{ durationMin: '45', wbgtC: '31' }, { durationMin: '15', wbgtC: '24' }],
      metabolicPeriods: [{ durationMin: '45', metabolicRateW: '400' }, { durationMin: '15', metabolicRateW: '120' }],
    };
    const inputs = impl.heatInputs(f);
    if (inputs.error) return false;
    const a = impl.evaluateHeat(inputs).assessment;
    return Object.entries(g.expect).every(([k, v]) => (typeof v === 'number' ? near(a[k], v) : a[k] === v));
  },

  // WBGT outdoors from the three temperatures: 25 / 45 / 32 C gives 29.7 C.
  wbgt_outdoor: (impl) => {
    const g = golden('wbgt-outdoor');
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'outdoor',
      wbgtPeriods: [{ durationMin: '60', naturalWetBulbC: '25', globeC: '45', dryBulbC: '32' }],
      metabolicPeriods: [{ durationMin: '60', metabolicRateW: '300' }],
    };
    const inputs = impl.heatInputs(f);
    if (inputs.error) return false;
    const r = impl.evaluateHeat(inputs);
    return near(r.periodWbgt[0].wbgtC, g.expect.wbgtC) && near(r.assessment.wbgtTwaC, g.expect.wbgtC);
  },
};

describe('the layer reproduces the published goldens through the engine', () => {
  test.each(Object.keys(CHECKS))('%s', (name) => {
    expect(CHECKS[name](REAL)).toBe(true);
  });

  test('the golden example ids it relies on are in the vendored file', () => {
    // the L108 example is looked up by content, guarding against a rename
    const l108 = GOLDEN.cases.find((c) => c.fn === 'lexEightHourDbA' && c.basis === 'published' && c.args[0].length === 3);
    expect(l108).toBeDefined();
    expect(l108.id).toBe('l108-figure-26');
  });
});

/* ------------------------------------------------------------------ */
/* Planted defects: each broken impl must turn its check red.          */
/* ------------------------------------------------------------------ */

const plant = (overrides) => ({ ...REAL, ...overrides });

const PLANTS = [
  {
    name: 'minutes read as hours',
    check: 'cfr1910_95_dose',
    impl: plant({ noiseInputs: (f) => forms.noiseInputs({ ...f, durationUnit: 'h' }) }),
  },
  {
    name: 'minutes read as hours (LEX)',
    check: 'l108_exposure_points',
    impl: plant({ noiseInputs: (f) => forms.noiseInputs({ ...f, durationUnit: 'h' }) }),
  },
  {
    name: 'mixture fed L/C instead of C/L',
    check: 'cfr1910_1000_mixture',
    impl: plant({
      evaluateMixture: (agents, evs) => ({
        result: mixtureExposureIndex(evs.map((e) => ({ concentration: e.twaLimit, limit: e.twa.twa8h }))),
      }),
    }),
  },
  {
    name: 'chemical TWA divided by sampled hours instead of 8',
    check: 'cfr1910_1000_twa',
    impl: plant({
      evaluateChemicalAgent: (a, s) => {
        const ev = evaluate.evaluateChemicalAgent(a, s);
        return { ...ev, twa: { ...ev.twa, twa8h: (ev.twa.twa8h * 8) / 7.5 } };
      },
    }),
  },
  {
    name: 'protector applied to the NIOSH TWA for the OSHA field derating',
    check: 'otm_field_50',
    impl: plant({
      evaluateNoise: (inputs) => {
        const r = evaluate.evaluateNoise({ ...inputs, protector: null });
        const niosh = r.criteria.find((c) => c.id === 'NIOSH_REL').result.twaDbA;
        return { ...r, protector: { result: hearingProtectorEstimate({ ...inputs.protector, exposureDb: niosh }) } };
      },
    }),
  },
  {
    name: 'C-weighted estimate given the A-weighted TWA',
    check: 'appB_c_weighted',
    impl: plant({ noiseInputs: (f) => forms.noiseInputs({ ...f, protectorWeighting: 'A' }) }),
  },
  {
    name: 'acclimatized flag inverted (REL)',
    check: 'heat_rel',
    impl: plant({ heatInputs: (f) => ({ ...forms.heatInputs(f), acclimatized: !f.acclimatized }) }),
  },
  {
    name: 'acclimatized flag inverted (RAL)',
    check: 'heat_ral',
    impl: plant({ heatInputs: (f) => ({ ...forms.heatInputs(f), acclimatized: !f.acclimatized }) }),
  },
  {
    name: 'outdoor readings computed with the indoor weights',
    check: 'wbgt_outdoor',
    impl: plant({ heatInputs: (f) => ({ ...forms.heatInputs(f), form: 'indoor' }) }),
  },
  {
    name: 'weekly hours dropped, so the daily factor always governs',
    check: 'brief_scala_weekly',
    impl: plant({ chemicalInputs: (f) => forms.chemicalInputs({ ...f, weeklyHours: '' }) }),
  },
  {
    name: 'shift hours dropped, so only the weekly factor is used',
    check: 'brief_scala_daily',
    impl: plant({ chemicalInputs: (f) => forms.chemicalInputs({ ...f, shiftHours: '' }) }),
  },
  {
    name: 'extended shift read as 8 hours',
    check: 'otm_extended_shift',
    impl: plant({ noiseInputs: (f) => forms.noiseInputs({ ...f, shiftHours: '8' }) }),
  },
  {
    name: 'STEL minutes read as hours',
    check: 'stel',
    impl: plant({
      chemicalInputs: (f) => {
        const r = forms.chemicalInputs(f);
        return { ...r, agents: r.agents.map((a) => ({ ...a, stelPeriods: a.stelPeriods.map((p) => ({ ...p, durationMin: p.durationMin / 60 })) })) };
      },
    }),
  },
];

describe('planted defects turn their golden check red', () => {
  test('every check has at least one plant', () => {
    const planted = new Set(PLANTS.map((p) => p.check));
    expect(Object.keys(CHECKS).filter((c) => !planted.has(c))).toEqual([]);
  });

  test.each(PLANTS.map((p) => [p.name, p]))('%s', (_name, p) => {
    let ok;
    try { ok = CHECKS[p.check](p.impl); } catch { ok = false; }
    expect(ok).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Refusals and warnings pass through by name                          */
/* ------------------------------------------------------------------ */

describe('refusals and warnings reach the screen by name', () => {
  test('a half-filled period is refused naming the period and field, never read as zero', () => {
    const r = forms.noiseInputs(noiseForm([[90, 4], ['', 4]]));
    expect(r.field).toBe('periods[1].levelDbA');
    expect(forms.noiseInputs(noiseForm([['ninety', 4]])).field).toBe('periods[0].levelDbA');
  });

  test('empty rows are skipped and an all-empty table is refused', () => {
    expect(forms.noiseInputs(noiseForm([[90, 8], ['', '']])).periods).toHaveLength(1);
    expect(forms.noiseInputs(noiseForm([['', '']])).field).toBe('periods');
  });

  test('the engine refusal for more than 24 hours comes back with its field', () => {
    const inputs = forms.noiseInputs(noiseForm([[90, 20], [85, 5]]));
    const r = evaluate.evaluateNoise(inputs);
    for (const c of r.criteria) expect(c.result).toMatchObject({ field: 'periods' });
    expect(r.lex).toMatchObject({ field: 'periods' });
  });

  test('the NIOSH ceiling and Table G-16 warnings are passed through', () => {
    const r = evaluate.evaluateNoise(forms.noiseInputs(noiseForm([[116, 0.1], [85, 7]])));
    expect(r.criteria.find((c) => c.id === 'NIOSH_REL').result.warnings.join(' ')).toMatch(/ceiling/);
    expect(r.criteria.find((c) => c.id === 'OSHA_PEL').result.warnings.join(' ')).toMatch(/115 dBA/);
  });

  test('a protector with no TWA to attenuate says why instead of estimating', () => {
    const r = evaluate.evaluateNoise(forms.noiseInputs(noiseForm([[85, 8]], 'h', { protectorMethod: 'OSHA_FIELD_50', protectorNrr: '25' })));
    expect(r.protector.skipped).toBe(true);
    expect(r.protector.reason).toMatch(/threshold/);
  });

  test('the OSHA field derating on C-weighted data is the engine\'s refusal', () => {
    const r = evaluate.evaluateNoise(forms.noiseInputs(noiseForm([[95, 8]], 'h', {
      protectorMethod: 'OSHA_FIELD_50', protectorNrr: '25', protectorWeighting: 'C', protectorCLevel: '100',
    })));
    expect(r.protector.result).toMatchObject({ field: 'weighting' });
  });

  test('a limit without a source is refused by name', () => {
    const f = { ...forms.blankChemicalForm(), subjectLabel: 'x', agents: [agent('X', [[1, 8]], { twaLimit: '5' })] };
    expect(forms.chemicalInputs(f).field).toBe('agents[0].limitSource');
  });

  test('a STEL record over 15 minutes is the engine\'s refusal', () => {
    const f = { ...forms.blankChemicalForm(), subjectLabel: 'x', agents: [agent('X', [[1, 8]], { stelPeriods: [{ concentration: '5', durationMin: '20' }] })] };
    const inputs = forms.chemicalInputs(f);
    expect(evaluate.evaluateChemicalAgent(inputs.agents[0], inputs.schedule).stel).toMatchObject({ field: 'periods' });
  });

  test('the chemical TWA warnings about unsampled time pass through', () => {
    const f = { ...forms.blankChemicalForm(), subjectLabel: 'x', agents: [agent('X', [[40, 3], [10, 2.5]])] };
    const inputs = forms.chemicalInputs(f);
    const ev = evaluate.evaluateChemicalAgent(inputs.agents[0], inputs.schedule);
    expect(ev.twa.twa8h).toBe(golden('twa-part-shift-zero-fill').expect.twa8h);
    expect(ev.twa.warnings[0]).toMatch(/remainder counts as zero/);
  });

  test('the mixture needs two agents with TWA limits and lists the rest', () => {
    const f = {
      ...forms.blankChemicalForm(), subjectLabel: 'x', additive: true,
      agents: [agent('A', [[1, 8]], { twaLimit: '10', limitSource: 's' }), agent('B', [[1, 8]])],
    };
    const inputs = forms.chemicalInputs(f);
    const evs = inputs.agents.map((a) => evaluate.evaluateChemicalAgent(a, inputs.schedule));
    const m = evaluate.evaluateMixture(inputs.agents, evs);
    expect(m.result).toBeNull();
    expect(m.excluded).toEqual([{ index: 1, name: 'B', reason: 'it has no TWA limit' }]);
  });

  test('a heat hour that is not 60 minutes is the engine\'s refusal, by name', () => {
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'measured',
      wbgtPeriods: [{ durationMin: '50', wbgtC: '30' }],
      metabolicPeriods: [{ durationMin: '60', metabolicRateW: '300' }],
    };
    expect(evaluate.evaluateHeat(forms.heatInputs(f)).assessment).toMatchObject({ field: 'wbgtPeriods' });
  });

  test('a missing outdoor dry bulb is refused naming the period', () => {
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'outdoor',
      wbgtPeriods: [{ durationMin: '60', naturalWetBulbC: '25', globeC: '40', dryBulbC: '' }],
      metabolicPeriods: [{ durationMin: '60', metabolicRateW: '300' }],
    };
    expect(forms.heatInputs(f).field).toBe('wbgtPeriods[0].dryBulbC');
  });

  test('outside 116 to 580 W the extrapolation warning is passed through', () => {
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'x', form: 'measured',
      wbgtPeriods: [{ durationMin: '60', wbgtC: '25' }],
      metabolicPeriods: [{ durationMin: '60', metabolicRateW: '650' }],
    };
    const r = evaluate.evaluateHeat(forms.heatInputs(f));
    expect(r.assessment.warnings.join(' ')).toMatch(/extrapolated/);
  });
});

/* ------------------------------------------------------------------ */
/* Stored rows round-trip to the same answer                           */
/* ------------------------------------------------------------------ */

describe('database rows', () => {
  test('a noise record saves and reloads to the same engine result', () => {
    const f = noiseForm([[95, 120], [90, 240], [100, 60]], 'min', {
      shiftHours: '7', protectorMethod: 'NIOSH_TYPE', protectorNrr: '30', protectorType: 'earmuff',
    });
    const inputs = forms.noiseInputs(f);
    const row = forms.noiseRowFromForm(f, inputs);
    expect(row.periods).toEqual([{ levelDbA: 95, durationH: 2 }, { levelDbA: 90, durationH: 4 }, { levelDbA: 100, durationH: 1 }]);
    expect(row.protector_type).toBe('earmuff');
    expect(row.protector_c_weighted_db).toBeNull();
    const again = evaluate.evaluateNoise(forms.noiseInputsFromRow({ ...row, protector_nrr_db: '30', shift_hours: '7' }));
    expect(again).toEqual(evaluate.evaluateNoise(inputs));
    expect(forms.noiseInputs(forms.noiseFormFromRow(row))).toEqual(inputs);
  });

  test('an additive chemical sample shares one mixture group and every row has an id', () => {
    const f = {
      ...forms.blankChemicalForm(), subjectLabel: 'Tank cleaners', additive: true,
      agents: [agent('A', [[500, 8]], { twaLimit: '1000', limitSource: 's' }), agent('B', [[45, 8]], { twaLimit: '200', limitSource: 's' })],
    };
    const rows = forms.chemicalRowsFromForm(f, forms.chemicalInputs(f));
    expect(rows).toHaveLength(2);
    expect(rows[0].mixture_group_id).toBeTruthy();
    expect(rows[1].mixture_group_id).toBe(rows[0].mixture_group_id);
    expect(rows[0].id).not.toBe(rows[1].id);
    const back = forms.chemicalFormFromRows(rows);
    expect(back.additive).toBe(true);
    expect(forms.chemicalInputs(back)).toEqual(forms.chemicalInputs(f));
    // a single agent, or a non-additive sample, has no group
    expect(forms.chemicalRowsFromForm({ ...f, additive: false }, forms.chemicalInputs(f))[0].mixture_group_id).toBeNull();
  });

  test('a heat record keeps the activity labels and evaluates the same from the row', () => {
    const f = {
      ...forms.blankHeatForm(), subjectLabel: 'Deck crew', form: 'outdoor',
      wbgtPeriods: [
        { durationMin: '45', naturalWetBulbC: '25', globeC: '45', dryBulbC: '32' },
        { durationMin: '15', naturalWetBulbC: '22', globeC: '30', dryBulbC: '28' },
      ],
      metabolicPeriods: [
        { durationMin: '45', metabolicRateW: '400', activity: 'Rigging' },
        { durationMin: '15', metabolicRateW: '120', activity: 'Rest in shade' },
      ],
    };
    const inputs = forms.heatInputs(f);
    const row = forms.heatRowFromForm(f, inputs);
    expect(row.metabolic_periods[0].activity).toBe('Rigging');
    expect(evaluate.evaluateHeat(forms.heatInputsFromRow(row))).toEqual(evaluate.evaluateHeat(inputs));
  });

  test('the presets shown side by side are the engine\'s own', () => {
    expect(evaluate.NOISE_PRESET_IDS.map((id) => NOISE_CRITERIA[id].id)).toEqual(['OSHA_PEL', 'OSHA_ACTION_LEVEL', 'NIOSH_REL']);
  });
});
