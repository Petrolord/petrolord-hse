// HS2 Occupational Hygiene: form state <-> engine inputs <-> database rows.
//
// Entered values are strings. A blank row is skipped; a half-filled row, or a
// value that is not a number, is refused BY NAME in the engine's own shape
// ({ error, field }), so the screen reports it the same way it reports an
// engine refusal and nothing is ever read as zero.

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const blankish = (v) => v === undefined || v === null || String(v).trim() === '';

/** '' -> null; '12.5' -> 12.5; 'abc' -> NaN. Never '' -> 0. */
export const parseNum = (v) => {
  if (blankish(v)) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
};

const refuse = (field, error) => ({ error, field });

/**
 * rows: [{ ...string fields }]; spec: [[formKey, engineKey, { required }]].
 * durationUnit: 'h' | 'min' converts the 'duration' form key to the engine's
 * durationKey (durationH or durationMin).
 * Returns { periods } or a refusal.
 */
export const parsePeriods = (rows, { spec, name = 'periods', duration }) => {
  const periods = [];
  const list = rows || [];
  for (let i = 0; i < list.length; i += 1) {
    const row = list[i] || {};
    const keys = [...spec.map(([k]) => k), ...(duration ? ['duration'] : [])];
    if (keys.every((k) => blankish(row[k]))) continue; // an empty row is not a period
    const p = {};
    for (const [formKey, engineKey] of spec) {
      const n = parseNum(row[formKey]);
      if (n === null || Number.isNaN(n)) return refuse(`${name}[${i}].${engineKey}`, `${name}[${i}].${engineKey} must be a number`);
      p[engineKey] = n;
    }
    if (duration) {
      const n = parseNum(row.duration);
      if (n === null || Number.isNaN(n)) return refuse(`${name}[${i}].${duration.key}`, `${name}[${i}].${duration.key} must be a number`);
      p[duration.key] = convertDuration(n, duration.unit, duration.key);
    }
    periods.push(p);
  }
  if (periods.length === 0) return refuse(name, `${name} needs at least one filled row`);
  return { periods };
};

/** Minutes and hours, converted to the unit the engine key names. */
export const convertDuration = (value, unit, engineKey) => {
  const wantHours = engineKey === 'durationH';
  if (unit === 'min') return wantHours ? value / 60 : value;
  return wantHours ? value : value * 60; // unit 'h'
};

/** An optional number field: '' is null, junk is a refusal naming the field. */
export const optionalNum = (value, field) => {
  const n = parseNum(value);
  if (Number.isNaN(n)) return refuse(field, `${field} must be a number or left blank`);
  return { value: n };
};

/* ------------------------------------------------------------------ */
/* Noise                                                               */
/* ------------------------------------------------------------------ */

export const blankNoiseForm = () => ({
  id: null,
  sampleDate: today(),
  siteId: 'none',
  subjectLabel: '',
  shiftHours: '',
  durationUnit: 'h',
  periods: [{ level: '', duration: '' }, { level: '', duration: '' }],
  criterion: 'OSHA_PEL',
  protectorName: '',
  protectorMethod: 'none',
  protectorNrr: '',
  protectorWeighting: 'A',
  protectorCLevel: '',
  protectorType: 'earmuff',
  instrument: '',
  notes: '',
});

/** Form -> { periods, shiftHours, protector } for evaluateNoise, or a refusal. */
export const noiseInputs = (form) => {
  const p = parsePeriods(form.periods, {
    spec: [['level', 'levelDbA']],
    duration: { key: 'durationH', unit: form.durationUnit },
  });
  if (p.error) return p;
  const shift = optionalNum(form.shiftHours, 'shiftHours');
  if (shift.error) return shift;
  let protector = null;
  if (form.protectorMethod && form.protectorMethod !== 'none') {
    const nrr = parseNum(form.protectorNrr);
    if (nrr === null || Number.isNaN(nrr)) return refuse('nrrDb', 'nrrDb must be a number: enter the protector\'s labelled NRR');
    let cWeightedDb;
    if (form.protectorWeighting === 'C') {
      const c = parseNum(form.protectorCLevel);
      if (c === null || Number.isNaN(c)) return refuse('exposureDb', 'exposureDb must be a number: enter the C-weighted level measured for this worker');
      cWeightedDb = c;
    }
    protector = {
      method: form.protectorMethod,
      nrrDb: nrr,
      weighting: form.protectorWeighting,
      protectorType: form.protectorMethod === 'NIOSH_TYPE' ? form.protectorType : undefined,
      cWeightedDb,
    };
  }
  return { periods: p.periods, shiftHours: shift.value, protector };
};

const siteOut = (siteId) => (siteId && siteId !== 'none' ? siteId : null);
const text = (v) => (blankish(v) ? null : String(v).trim());

export const noiseRowFromForm = (form, inputs) => ({
  site_id: siteOut(form.siteId),
  subject_label: form.subjectLabel.trim(),
  sample_date: form.sampleDate,
  shift_hours: inputs.shiftHours,
  periods: inputs.periods,
  criterion: form.criterion,
  protector_name: inputs.protector ? text(form.protectorName) : null,
  protector_method: inputs.protector ? inputs.protector.method : null,
  protector_nrr_db: inputs.protector ? inputs.protector.nrrDb : null,
  protector_weighting: inputs.protector ? inputs.protector.weighting : 'A',
  protector_c_weighted_db: inputs.protector && inputs.protector.weighting === 'C' ? inputs.protector.cWeightedDb : null,
  protector_type: inputs.protector && inputs.protector.method === 'NIOSH_TYPE' ? inputs.protector.protectorType : null,
  instrument: text(form.instrument),
  notes: text(form.notes),
});

const str = (v) => (v === null || v === undefined ? '' : String(v));

/** A stored row back into the form (durations shown in hours, as stored). */
export const noiseFormFromRow = (row) => ({
  id: row.id,
  sampleDate: row.sample_date,
  siteId: row.site_id || 'none',
  subjectLabel: row.subject_label || '',
  shiftHours: str(row.shift_hours),
  durationUnit: 'h',
  periods: (row.periods || []).map((p) => ({ level: str(p.levelDbA), duration: str(p.durationH) })),
  criterion: row.criterion || 'OSHA_PEL',
  protectorName: row.protector_name || '',
  protectorMethod: row.protector_method || 'none',
  protectorNrr: str(row.protector_nrr_db),
  protectorWeighting: row.protector_weighting || 'A',
  protectorCLevel: str(row.protector_c_weighted_db),
  protectorType: row.protector_type || 'earmuff',
  instrument: row.instrument || '',
  notes: row.notes || '',
});

/** A stored row straight into evaluateNoise inputs. */
export const noiseInputsFromRow = (row) => ({
  periods: row.periods,
  shiftHours: row.shift_hours === null || row.shift_hours === undefined ? null : Number(row.shift_hours),
  protector: row.protector_method ? {
    method: row.protector_method,
    nrrDb: Number(row.protector_nrr_db),
    weighting: row.protector_weighting || 'A',
    protectorType: row.protector_type || undefined,
    cWeightedDb: row.protector_c_weighted_db === null || row.protector_c_weighted_db === undefined ? undefined : Number(row.protector_c_weighted_db),
  } : null,
});

/* ------------------------------------------------------------------ */
/* Chemical                                                            */
/* ------------------------------------------------------------------ */

export const CHEMICAL_UNITS = ['ppm', 'mg/m3', 'ug/m3', 'f/cc'];

export const blankAgent = () => ({
  id: null,
  agentName: '',
  casNumber: '',
  units: 'ppm',
  twaLimit: '',
  stelLimit: '',
  limitSource: '',
  durationUnit: 'h',
  periods: [{ concentration: '', duration: '' }],
  stelPeriods: [{ concentration: '', durationMin: '' }],
  samplingMethod: '',
});

export const blankChemicalForm = () => ({
  groupId: null,
  sampleDate: today(),
  siteId: 'none',
  subjectLabel: '',
  shiftHours: '',
  weeklyHours: '',
  additive: false,
  agents: [blankAgent()],
  notes: '',
  removedIds: [],
});

/** One agent's form -> engine inputs, or a refusal naming agents[i].<field>. */
export const agentInputs = (agent, i) => {
  const prefix = `agents[${i}]`;
  if (blankish(agent.agentName)) return refuse(`${prefix}.agentName`, 'every agent needs a name');
  const p = parsePeriods(agent.periods, {
    name: `${prefix}.periods`,
    spec: [['concentration', 'concentration']],
    duration: { key: 'durationH', unit: agent.durationUnit },
  });
  if (p.error) return p;
  const stelRows = (agent.stelPeriods || []).filter((r) => !(blankish(r.concentration) && blankish(r.durationMin)));
  let stelPeriods = null;
  if (stelRows.length) {
    const s = parsePeriods(agent.stelPeriods, {
      name: `${prefix}.stelPeriods`,
      spec: [['concentration', 'concentration'], ['durationMin', 'durationMin']],
    });
    if (s.error) return s;
    stelPeriods = s.periods;
  }
  const twa = optionalNum(agent.twaLimit, `${prefix}.twaLimit`);
  if (twa.error) return twa;
  const stel = optionalNum(agent.stelLimit, `${prefix}.stelLimit`);
  if (stel.error) return stel;
  if ((twa.value !== null || stel.value !== null) && blankish(agent.limitSource)) {
    return refuse(`${prefix}.limitSource`, 'a limit needs its source (for example the regulation, table or company standard it comes from)');
  }
  return {
    agentName: agent.agentName.trim(),
    periods: p.periods,
    stelPeriods,
    twaLimit: twa.value,
    stelLimit: stel.value,
  };
};

/** The whole sample: schedule plus every agent's inputs, or the first refusal. */
export const chemicalInputs = (form) => {
  const shift = optionalNum(form.shiftHours, 'shiftHours');
  if (shift.error) return shift;
  const weekly = optionalNum(form.weeklyHours, 'weeklyHours');
  if (weekly.error) return weekly;
  const agents = [];
  for (let i = 0; i < form.agents.length; i += 1) {
    const a = agentInputs(form.agents[i], i);
    if (a.error) return a;
    agents.push(a);
  }
  return { schedule: { shiftHours: shift.value, weeklyHours: weekly.value }, agents };
};

const newId = () => (globalThis.crypto && globalThis.crypto.randomUUID
  ? globalThis.crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : ((r % 4) + 8)).toString(16);
  }));

/**
 * One row per agent. Every row carries its own id (new rows get one here)
 * so the whole sample saves in ONE upsert statement. Agents share a
 * mixture_group_id when the user judged them additive and there are two or
 * more; otherwise they share a sample group id only through date and label.
 */
export const chemicalRowsFromForm = (form, inputs) => {
  const grouped = form.additive && inputs.agents.length > 1;
  const groupId = grouped ? (form.groupId || newId()) : null;
  return form.agents.map((a, i) => ({
    id: a.id || newId(),
    site_id: siteOut(form.siteId),
    subject_label: form.subjectLabel.trim(),
    sample_date: form.sampleDate,
    agent_name: inputs.agents[i].agentName,
    cas_number: text(a.casNumber),
    units: a.units,
    twa_limit: inputs.agents[i].twaLimit,
    stel_limit: inputs.agents[i].stelLimit,
    limit_source: text(a.limitSource),
    periods: inputs.agents[i].periods,
    stel_periods: inputs.agents[i].stelPeriods,
    shift_hours: inputs.schedule.shiftHours,
    weekly_hours: inputs.schedule.weeklyHours,
    mixture_group_id: groupId,
    sampling_method: text(a.samplingMethod),
    notes: text(form.notes),
  }));
};

/** Rows of one sample (one row, or all rows of a mixture group) into the form. */
export const chemicalFormFromRows = (rows) => {
  const first = rows[0];
  return {
    groupId: first.mixture_group_id || null,
    sampleDate: first.sample_date,
    siteId: first.site_id || 'none',
    subjectLabel: first.subject_label || '',
    shiftHours: str(first.shift_hours),
    weeklyHours: str(first.weekly_hours),
    additive: !!first.mixture_group_id,
    notes: first.notes || '',
    removedIds: [],
    agents: rows.map((r) => ({
      id: r.id,
      agentName: r.agent_name || '',
      casNumber: r.cas_number || '',
      units: r.units || 'ppm',
      twaLimit: str(r.twa_limit),
      stelLimit: str(r.stel_limit),
      limitSource: r.limit_source || '',
      durationUnit: 'h',
      periods: (r.periods || []).map((p) => ({ concentration: str(p.concentration), duration: str(p.durationH) })),
      stelPeriods: r.stel_periods && r.stel_periods.length
        ? r.stel_periods.map((p) => ({ concentration: str(p.concentration), durationMin: str(p.durationMin) }))
        : [{ concentration: '', durationMin: '' }],
      samplingMethod: r.sampling_method || '',
    })),
  };
};

/** A stored agent row straight into evaluateChemicalAgent inputs. */
export const agentInputsFromRow = (row) => ({
  agentName: row.agent_name,
  periods: row.periods,
  stelPeriods: row.stel_periods && row.stel_periods.length ? row.stel_periods : null,
  twaLimit: row.twa_limit === null || row.twa_limit === undefined ? null : Number(row.twa_limit),
  stelLimit: row.stel_limit === null || row.stel_limit === undefined ? null : Number(row.stel_limit),
});

export const scheduleFromRow = (row) => ({
  shiftHours: row.shift_hours === null || row.shift_hours === undefined ? null : Number(row.shift_hours),
  weeklyHours: row.weekly_hours === null || row.weekly_hours === undefined ? null : Number(row.weekly_hours),
});

/* ------------------------------------------------------------------ */
/* Heat                                                                */
/* ------------------------------------------------------------------ */

export const blankHeatForm = () => ({
  id: null,
  assessmentDate: today(),
  siteId: 'none',
  subjectLabel: '',
  form: 'outdoor',
  acclimatized: true,
  wbgtPeriods: [
    { durationMin: '45', naturalWetBulbC: '', globeC: '', dryBulbC: '', wbgtC: '' },
    { durationMin: '15', naturalWetBulbC: '', globeC: '', dryBulbC: '', wbgtC: '' },
  ],
  metabolicPeriods: [
    { durationMin: '45', metabolicRateW: '', activity: '' },
    { durationMin: '15', metabolicRateW: '', activity: '' },
  ],
  clothing: '',
  instrument: '',
  notes: '',
});

const WBGT_SPEC = {
  indoor: [['naturalWetBulbC', 'naturalWetBulbC'], ['globeC', 'globeC'], ['durationMin', 'durationMin']],
  outdoor: [['naturalWetBulbC', 'naturalWetBulbC'], ['globeC', 'globeC'], ['dryBulbC', 'dryBulbC'], ['durationMin', 'durationMin']],
  measured: [['wbgtC', 'wbgtC'], ['durationMin', 'durationMin']],
};

export const heatInputs = (form) => {
  const spec = WBGT_SPEC[form.form];
  if (!spec) return refuse('wbgtForm', 'choose indoor, outdoor or measured WBGT');
  const w = parsePeriods(form.wbgtPeriods, { name: 'wbgtPeriods', spec });
  if (w.error) return w;
  const m = parsePeriods(form.metabolicPeriods, {
    name: 'metabolicPeriods',
    spec: [['metabolicRateW', 'metabolicRateW'], ['durationMin', 'durationMin']],
  });
  if (m.error) return m;
  return { form: form.form, wbgtPeriods: w.periods, metabolicPeriods: m.periods, acclimatized: !!form.acclimatized };
};

export const heatRowFromForm = (form, inputs) => ({
  site_id: siteOut(form.siteId),
  subject_label: form.subjectLabel.trim(),
  assessment_date: form.assessmentDate,
  wbgt_form: inputs.form,
  wbgt_periods: inputs.wbgtPeriods,
  // the activity labels ride along in the stored periods for the record
  metabolic_periods: inputs.metabolicPeriods.map((p, i) => {
    const filled = form.metabolicPeriods.filter((r) => !blankish(r.metabolicRateW) || !blankish(r.durationMin));
    const activity = text(filled[i]?.activity);
    return activity ? { ...p, activity } : p;
  }),
  acclimatized: inputs.acclimatized,
  clothing: text(form.clothing),
  instrument: text(form.instrument),
  notes: text(form.notes),
});

export const heatFormFromRow = (row) => ({
  id: row.id,
  assessmentDate: row.assessment_date,
  siteId: row.site_id || 'none',
  subjectLabel: row.subject_label || '',
  form: row.wbgt_form,
  acclimatized: !!row.acclimatized,
  wbgtPeriods: (row.wbgt_periods || []).map((p) => ({
    durationMin: str(p.durationMin),
    naturalWetBulbC: str(p.naturalWetBulbC),
    globeC: str(p.globeC),
    dryBulbC: str(p.dryBulbC),
    wbgtC: str(p.wbgtC),
  })),
  metabolicPeriods: (row.metabolic_periods || []).map((p) => ({
    durationMin: str(p.durationMin), metabolicRateW: str(p.metabolicRateW), activity: p.activity || '',
  })),
  clothing: row.clothing || '',
  instrument: row.instrument || '',
  notes: row.notes || '',
});

export const heatInputsFromRow = (row) => ({
  form: row.wbgt_form,
  wbgtPeriods: row.wbgt_periods,
  metabolicPeriods: (row.metabolic_periods || []).map(({ metabolicRateW, durationMin }) => ({ metabolicRateW, durationMin })),
  acclimatized: !!row.acclimatized,
});
