// The data-shaping layer between the database rows and the safety statistics
// engine. Pure functions, no I/O, so every rule here is unit tested
// (aggregate.test.js).
//
// Rules that matter, all visible to the user:
//   * A month with no exposure hours has NO rate. Its hours are null, never 0,
//     and events that fall in it are counted as "outside recorded hours" and
//     left out of every rate, because the engine rightly refuses an event
//     with no one at work.
//   * A report with no classification is UNCLASSIFIED: it is counted on its
//     own and never treated as non-recordable.
//   * Pooled and rolling rates are sum-then-divide (the engine's rule); the
//     mean of monthly rates is shown beside the rolling rate, labelled, for
//     contrast only.

import { metricById, rateFor, intervalFor, baseFor, DEFAULT_CONFIDENCE } from './definitions';
import { rollingRate, uChart, compareRates } from '@/lib/engines/safetyStats';

/* ------------------------------------------------------------ months */

const pad2 = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM' of a 'YYYY-MM-DD' date or an ISO timestamp (local calendar). */
export const monthKeyOf = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

/** The month an event belongs to: the day it occurred when recorded, else the day it was reported. */
export const eventMonth = (report) => monthKeyOf(report.occurred_on) || monthKeyOf(report.created_at);

export const addMonths = (key, n) => {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${pad2((idx % 12) + 1)}`;
};

export const compareMonths = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** Every month from `from` to `to` inclusive; empty when from is after to. */
export const monthsBetween = (from, to) => {
  const out = [];
  if (!from || !to || from > to) return out;
  for (let k = from; k <= to; k = addMonths(k, 1)) out.push(k);
  return out;
};

export const monthStart = (key) => `${key}-01`;
export const monthEnd = (key) => {
  const [y, m] = key.split('-').map(Number);
  return `${key}-${pad2(new Date(y, m, 0).getDate())}`;
};

/** Earliest month that has either a report or an hours row, or null. */
export const firstDataMonth = (reports = [], exposure = []) => {
  const keys = [
    ...reports.map(eventMonth),
    ...exposure.map((r) => monthKeyOf(r.period_start)),
  ].filter(Boolean).sort();
  return keys[0] || null;
};

/* ------------------------------------------------------------ filters */

const siteMatches = (siteId, rowSite) => {
  if (!siteId || siteId === 'all') return true;
  if (siteId === 'unattributed') return rowSite == null;
  return rowSite === siteId;
};

/* ------------------------------------------------------------ exposure */

/**
 * Hours per month for a site filter and a workforce view.
 *
 * Each (site, month) is resolved on its own:
 *   combined view:   the 'combined' row if there is one, otherwise the sum of
 *                    the employee and contractor rows. A combined row next to
 *                    split rows is a conflict: the combined row is used and a
 *                    warning is raised (adding them would double count).
 *   employee or contractor view: that workforce's row only. A (site, month)
 *                    with only a combined row has no split to use; it
 *                    contributes nothing and raises a warning.
 * A month nobody recorded hours for is absent from the map: no hours, never 0.
 */
export const exposureByMonth = (rows = [], { siteId = 'all', workforce = 'combined' } = {}) => {
  const groups = new Map();
  for (const r of rows) {
    if (!siteMatches(siteId, r.site_id ?? null)) continue;
    const month = monthKeyOf(r.period_start);
    const hours = Number(r.hours);
    if (!month || !Number.isFinite(hours) || !(hours > 0)) continue;
    const key = `${r.site_id ?? ''}|${month}`;
    if (!groups.has(key)) groups.set(key, { month, siteId: r.site_id ?? null, combined: null, employee: 0, contractor: 0, hasSplit: false });
    const g = groups.get(key);
    if (r.workforce === 'combined') g.combined = (g.combined || 0) + hours;
    else if (r.workforce === 'employee' || r.workforce === 'contractor') {
      g[r.workforce] += hours;
      g.hasSplit = true;
      g[`has_${r.workforce}`] = true;
    }
  }

  const byMonth = new Map();
  const warnings = [];
  for (const g of groups.values()) {
    let value = null;
    if (workforce === 'combined') {
      if (g.combined !== null) {
        value = g.combined;
        if (g.hasSplit) warnings.push({ type: 'combined-and-split', month: g.month, siteId: g.siteId });
      } else if (g.hasSplit) {
        value = g.employee + g.contractor;
      }
    } else if (g[`has_${workforce}`]) {
      value = g[workforce];
    } else if (g.combined !== null) {
      warnings.push({ type: 'combined-only', month: g.month, siteId: g.siteId, workforce });
    }
    if (value !== null) byMonth.set(g.month, (byMonth.get(g.month) || 0) + value);
  }
  warnings.sort((a, b) => compareMonths(a.month, b.month));
  return { byMonth, warnings };
};

/* ------------------------------------------------------------ reports */

const RECORDABLE = new Set(['fatality', 'lost_time', 'restricted', 'medical_treatment']);

export const emptyCounts = () => ({
  reports: 0,
  classified: 0,
  unclassified: 0,
  workforceUnknown: 0,
  recordable: 0,
  dart: 0,
  lti: 0,
  fatality: 0,
  daysAway: 0,
  lostTimeMissingDays: 0,
  pse1: 0,
  pse2: 0,
  pseAssessed: 0,
  pseUnassessed: 0,
});

const addCounts = (into, c) => {
  for (const k of Object.keys(into)) into[k] += c[k] || 0;
  return into;
};

/**
 * Count one report into a month's tallies.
 *
 * Workforce views: in the employee (or contractor) view a report classified
 * for the OTHER workforce is skipped; a classified injury with no workforce
 * recorded cannot be placed, so it is counted as workforceUnknown and left out
 * of the rates. PSE tiers are counted in the combined view only: API RP 754
 * rates use total work hours.
 */
const tallyReport = (c, r, workforce) => {
  if (workforce !== 'combined' && r.workforce && r.workforce !== workforce) return;
  c.reports += 1;

  const cls = r.injury_classification;
  if (!cls) {
    c.unclassified += 1;
  } else if (workforce !== 'combined' && !r.workforce) {
    c.classified += 1;
    if (RECORDABLE.has(cls)) c.workforceUnknown += 1;
  } else {
    c.classified += 1;
    if (RECORDABLE.has(cls)) c.recordable += 1;
    if (cls === 'lost_time' || cls === 'restricted') c.dart += 1;
    if (cls === 'lost_time' || cls === 'fatality') c.lti += 1;
    if (cls === 'fatality') c.fatality += 1;
    if (cls === 'lost_time') {
      if (Number.isInteger(r.days_away) && r.days_away >= 0) c.daysAway += r.days_away;
      else c.lostTimeMissingDays += 1;
    }
  }

  if (workforce === 'combined') {
    if (!r.pse_classification) c.pseUnassessed += 1;
    else {
      c.pseAssessed += 1;
      if (r.pse_classification === 'tier_1') c.pse1 += 1;
      if (r.pse_classification === 'tier_2') c.pse2 += 1;
    }
  }
};

/** Reports that count at all: submitted ones (a draft is not a report yet). */
export const countableReports = (reports = []) => reports.filter((r) => r && r.status !== 'draft');

export const reportsByMonth = (reports = [], { siteId = 'all', workforce = 'combined' } = {}) => {
  const byMonth = new Map();
  for (const r of countableReports(reports)) {
    if (!siteMatches(siteId, r.site_id ?? null)) continue;
    const month = eventMonth(r);
    if (!month) continue;
    if (!byMonth.has(month)) byMonth.set(month, emptyCounts());
    tallyReport(byMonth.get(month), r, workforce);
  }
  return byMonth;
};

/* ------------------------------------------------------------ series */

/**
 * The month-by-month series the engine is fed, from `from` to `to`.
 * Each month: { month, hours (number or null), counts }.
 * totals: counts summed over months WITH hours (what the rates use).
 * outside: counts summed over months WITHOUT hours (left out, shown).
 */
export const buildSeries = ({ reports = [], exposure = [], from, to, siteId = 'all', workforce = 'combined' }) => {
  const { byMonth: hoursByMonth, warnings } = exposureByMonth(exposure, { siteId, workforce });
  const countsByMonth = reportsByMonth(reports, { siteId, workforce });
  const months = monthsBetween(from, to).map((month) => ({
    month,
    hours: hoursByMonth.has(month) ? hoursByMonth.get(month) : null,
    counts: countsByMonth.get(month) || emptyCounts(),
  }));
  const totals = emptyCounts();
  const outside = emptyCounts();
  const all = emptyCounts();
  let hours = 0;
  const monthsWithoutHours = [];
  for (const m of months) {
    addCounts(all, m.counts);
    if (m.hours !== null) {
      hours += m.hours;
      addCounts(totals, m.counts);
    } else {
      monthsWithoutHours.push(m.month);
      addCounts(outside, m.counts);
    }
  }
  return {
    from, to, siteId, workforce, months, totals, outside, all, hours,
    monthsWithHours: months.length - monthsWithoutHours.length,
    monthsWithoutHours,
    warnings: warnings.filter((w) => w.month >= from && w.month <= to),
  };
};

/* ------------------------------------------------------------ rates */

/** Reports left out of a metric because they are not classified for it. */
export const unclassifiedFor = (metric, totals) => {
  if (metric.kind === 'pse') return totals.pseUnassessed;
  return totals.unclassified;
};

/**
 * Every metric's pooled rate over the series, with its Garwood interval.
 * status: 'ok' | 'no-hours' | 'not-applicable' | 'refused'.
 */
export const computeRates = (series, metrics, { base, confidence = DEFAULT_CONFIDENCE } = {}) => metrics.map((metric) => {
  const out = {
    metric,
    base: baseFor(metric, base),
    count: series.totals[metric.countKey],
    exposureHours: series.hours,
    unclassified: unclassifiedFor(metric, series.totals),
    outsideHours: series.outside[metric.countKey],
    workforceUnknown: metric.kind === 'pse' ? 0 : series.totals.workforceUnknown,
    missingDays: metric.kind === 'days' ? series.totals.lostTimeMissingDays : 0,
  };
  if (metric.kind === 'pse' && series.workforce !== 'combined') {
    return { ...out, status: 'not-applicable', reason: 'Process safety event rates use total work hours. Switch to employees and contractors.' };
  }
  if (!(series.hours > 0)) return { ...out, status: 'no-hours', reason: 'No exposure hours are recorded for this selection.' };
  const r = rateFor(metric, { count: out.count, exposureHours: series.hours, base });
  if (r.error) return { ...out, status: 'refused', reason: r.error };
  const ci = intervalFor(metric, { count: out.count, exposureHours: series.hours, base, confidence });
  return {
    ...out,
    status: 'ok',
    rate: r.rate,
    basis: r.basis,
    interval: ci && !ci.error ? { lower: ci.lower, upper: ci.upper, confidence: ci.confidence, method: ci.basis.method } : null,
  };
});

/* ------------------------------------------------------------ rolling */

/**
 * Rolling rate over a trailing window of months, one entry per complete
 * window, sum-then-divide, with the mean of the monthly rates beside it.
 * Events in months without hours are zeroed before the engine sees them
 * (they are reported as excludedEvents), because the engine refuses events
 * with no exposure.
 */
export const rollingFromSeries = (series, metric, { base, windowMonths = 12 } = {}) => {
  if (metric.kind === 'pse' && series.workforce !== 'combined') return { status: 'not-applicable', windows: [] };
  const months = series.months;
  if (months.length < windowMonths) {
    return { status: 'too-short', needed: windowMonths, have: months.length, windows: [] };
  }
  const counts = months.map((m) => (m.hours !== null ? m.counts[metric.countKey] : 0));
  const hours = months.map((m) => (m.hours !== null ? m.hours : 0));
  const excludedEvents = months.reduce((a, m) => a + (m.hours === null ? m.counts[metric.countKey] : 0), 0);
  const r = rollingRate({ counts, exposureHours: hours, base: baseFor(metric, base), windowPeriods: windowMonths });
  if (r.error) return { status: 'refused', reason: r.error, windows: [] };
  return {
    status: 'ok',
    basis: r.basis,
    excludedEvents,
    windows: r.windows.map((w) => ({ ...w, month: months[w.endIndex].month, startMonth: months[w.startIndex].month })),
  };
};

/* ------------------------------------------------------------ u-chart */

/**
 * u-chart over the months that have hours (the engine refuses a zero-hours
 * point). Months without hours are listed in `skippedMonths`.
 */
export const uChartFromSeries = (series, metric, { base } = {}) => {
  if (metric.kind === 'days') return { status: 'not-applicable', reason: 'A u-chart needs event counts; days away are not independent events.' };
  if (metric.kind === 'pse' && series.workforce !== 'combined') return { status: 'not-applicable', reason: 'Process safety event rates use total work hours.' };
  const rated = series.months.filter((m) => m.hours !== null);
  const skippedMonths = series.months.filter((m) => m.hours === null).map((m) => m.month);
  if (rated.length === 0) return { status: 'no-hours', skippedMonths };
  const r = uChart({ counts: rated.map((m) => m.counts[metric.countKey]), exposureHours: rated.map((m) => m.hours), base: baseFor(metric, base) });
  if (r.error) return { status: 'refused', reason: r.error, skippedMonths };
  return {
    status: 'ok',
    centre: r.centre,
    basis: r.basis,
    skippedMonths,
    points: r.points.map((p) => ({ ...p, month: rated[p.index].month })),
    outOfControl: r.outOfControl.map((i) => rated[i].month),
  };
};

/* ------------------------------------------------------------ comparison */

/**
 * Compare two selections (period and site) on one count metric: each side's
 * pooled rate and interval, and the engine's conditional exact test.
 */
export const compareSelections = ({ reports, exposure, a, b, workforce = 'combined', metricId, base, confidence = DEFAULT_CONFIDENCE }) => {
  const metric = metricById(metricId);
  const side = (sel) => {
    const series = buildSeries({ reports, exposure, from: sel.from, to: sel.to, siteId: sel.siteId, workforce });
    const [rate] = computeRates(series, [metric], { base, confidence });
    return { selection: sel, series, rate };
  };
  const A = side(a);
  const B = side(b);
  if (metric.kind === 'days') {
    return { metric, a: A, b: B, status: 'not-applicable', reason: 'Days away are not independent events, so two severity rates cannot be tested this way.' };
  }
  if (A.rate.status !== 'ok' || B.rate.status !== 'ok') {
    return { metric, a: A, b: B, status: 'incomplete', reason: 'Both selections need exposure hours before they can be compared.' };
  }
  const c = compareRates({
    count1: A.rate.count, exposureHours1: A.rate.exposureHours,
    count2: B.rate.count, exposureHours2: B.rate.exposureHours,
    confidence,
  });
  if (c.error) return { metric, a: A, b: B, status: 'refused', reason: c.error };
  return { metric, a: A, b: B, status: 'ok', comparison: c };
};

