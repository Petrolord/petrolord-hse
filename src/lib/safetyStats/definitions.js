// What each safety statistic counts, and on what base. The arithmetic is the
// engine's (src/lib/engines/safetyStats.js, vendored from petrolord-engines);
// this file only says which classified reports feed which rate.
//
// Case classes follow the IOGP definitions quoted in the engine's FINDINGS:
//   TRIR = (fatalities + lost workday cases + restricted workday cases +
//           medical treatment cases) per base hours
//   LTIF = (fatalities + lost workday cases) per 1,000,000 hours
//   FAR  = fatalities per 100,000,000 hours
// and DART (OSHA/BLS) = cases with days away, restricted work or transfer.

import {
  RATE_BASES,
  incidenceRate,
  fatalAccidentRate,
  severityRate,
  pseRate,
  rateConfidenceInterval,
  compareRates,
  rollingRate,
  uChart,
} from '@/lib/engines/safetyStats';

export const INJURY_CLASSES = [
  { id: 'fatality', label: 'Fatality', recordable: true, help: 'A work-related death.' },
  { id: 'lost_time', label: 'Lost time (days away)', recordable: true, help: 'The person could not work on at least one full day after the day of the injury.' },
  { id: 'restricted', label: 'Restricted work or transfer', recordable: true, help: 'The person stayed at work but could not do their normal job, or was moved to another job.' },
  { id: 'medical_treatment', label: 'Medical treatment', recordable: true, help: 'Treatment beyond first aid by a doctor or other licensed professional.' },
  { id: 'first_aid', label: 'First aid only', recordable: false, help: 'Treated with first aid only. Not recordable.' },
  { id: 'near_miss', label: 'Near miss', recordable: false, help: 'No injury happened, but it could have. Not recordable.' },
  { id: 'no_injury', label: 'No injury (observation, unsafe act or condition)', recordable: false, help: 'No person was hurt. Not recordable.' },
];

export const PSE_CLASSES = [
  { id: 'tier_1', label: 'Tier 1 PSE', rated: true },
  { id: 'tier_2', label: 'Tier 2 PSE', rated: true },
  { id: 'tier_3', label: 'Tier 3 (challenge to a safety system)', rated: false },
  { id: 'tier_4', label: 'Tier 4 (operating discipline)', rated: false },
  { id: 'not_pse', label: 'Not a process safety event', rated: false },
];

export const WORKFORCES = [
  { id: 'combined', label: 'Employees and contractors' },
  { id: 'employee', label: 'Employees' },
  { id: 'contractor', label: 'Contractors' },
];

/** Bases the user can pick for the occupational rates (TRIR, DART, severity, PSE). */
export const OCCUPATIONAL_BASES = [
  { value: RATE_BASES.IOGP_1M, label: 'per 1,000,000 hours (IOGP)' },
  { value: RATE_BASES.OSHA_200K, label: 'per 200,000 hours (OSHA/BLS)' },
];

export const DEFAULT_CONFIDENCE = 0.95;

const RECORDABLE = ['fatality', 'lost_time', 'restricted', 'medical_treatment'];

/**
 * The rates the Safety Statistics module reports. `countKey` names the
 * per-month count the data layer builds (see aggregate.js). `fixedBase` is
 * set where the statistic has one definition; otherwise the user's
 * occupational base applies.
 */
export const METRICS = [
  {
    id: 'trir', short: 'TRIR', name: 'Total recordable case rate', countKey: 'recordable', kind: 'injury',
    classes: RECORDABLE,
    counts: 'Fatalities, lost time, restricted work and medical treatment cases.',
  },
  {
    id: 'dart', short: 'DART', name: 'Days away, restricted or transferred rate', countKey: 'dart', kind: 'injury',
    classes: ['lost_time', 'restricted'],
    counts: 'Lost time cases and restricted work or transfer cases.',
  },
  {
    id: 'ltif', short: 'LTIF', name: 'Lost time injury frequency', countKey: 'lti', kind: 'injury',
    classes: ['fatality', 'lost_time'], fixedBase: RATE_BASES.IOGP_1M,
    counts: 'Fatalities and lost time cases, per 1,000,000 hours.',
  },
  {
    id: 'far', short: 'FAR', name: 'Fatal accident rate', countKey: 'fatality', kind: 'injury',
    classes: ['fatality'], fixedBase: RATE_BASES.FAR_100M,
    counts: 'Fatalities, per 100,000,000 hours.',
  },
  {
    id: 'severity', short: 'Severity', name: 'Severity rate (days away)', countKey: 'daysAway', kind: 'days',
    classes: ['lost_time'],
    counts: 'Calendar days away from work on lost time cases. No interval: days are not independent events.',
  },
  {
    id: 'pse1', short: 'PSE T1', name: 'Tier 1 process safety event rate', countKey: 'pse1', kind: 'pse', tier: 1,
    counts: 'API RP 754 Tier 1 events as classified by your organization.',
  },
  {
    id: 'pse2', short: 'PSE T2', name: 'Tier 2 process safety event rate', countKey: 'pse2', kind: 'pse', tier: 2,
    counts: 'API RP 754 Tier 2 events as classified by your organization.',
  },
];

export const metricById = (id) => METRICS.find((m) => m.id === id);

/** The base a metric is reported on, given the user's occupational base. */
export const baseFor = (metric, occupationalBase) => metric.fixedBase || occupationalBase;

/**
 * One rate from the engine. Returns the engine's result object, which is
 * either { rate, basis, ... } or { error, field }.
 */
export const rateFor = (metric, { count, exposureHours, base }) => {
  const b = baseFor(metric, base);
  if (metric.id === 'far') return fatalAccidentRate({ fatalities: count, exposureHours });
  if (metric.kind === 'days') return severityRate({ daysLost: count, exposureHours, base: b });
  if (metric.kind === 'pse') return pseRate({ tier: metric.tier, pseCount: count, exposureHours, base: b });
  return incidenceRate({ count, exposureHours, base: b });
};

/** Garwood interval for an event-count metric; null for the days-based severity rate. */
export const intervalFor = (metric, { count, exposureHours, base, confidence = DEFAULT_CONFIDENCE }) => {
  if (metric.kind === 'days') return null;
  return rateConfidenceInterval({ count, exposureHours, base: baseFor(metric, base), confidence });
};

/**
 * The engine's own description of a metric's basis (base label, formula,
 * standard, note), got by asking the engine for a rate over one hour. The
 * help article and the on-screen labels both read this, so they cannot
 * drift from what the engine computes.
 */
export const basisFor = (metric, occupationalBase = RATE_BASES.IOGP_1M) => {
  const r = rateFor(metric, { count: 0, exposureHours: 1, base: occupationalBase });
  return r.basis || null;
};

export const intervalMethod = () => rateConfidenceInterval({ count: 1, exposureHours: 1, base: 1, confidence: DEFAULT_CONFIDENCE }).basis.method;
export const compareMethod = () => compareRates({ count1: 1, exposureHours1: 1, count2: 1, exposureHours2: 1, confidence: DEFAULT_CONFIDENCE }).basis.method;
export const rollingBasis = (base = RATE_BASES.IOGP_1M) => rollingRate({ counts: [0], exposureHours: [1], base, windowPeriods: 1 }).basis;
export const uChartMethod = () => uChart({ counts: [1], exposureHours: [1], base: 1 }).basis.method;

export { RATE_BASES };
