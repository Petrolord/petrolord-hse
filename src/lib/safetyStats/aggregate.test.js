// The data-shaping layer: database rows in, engine inputs out. Where a
// published or oracle-computed figure exists, the rows are built so that the
// layer must reproduce it THROUGH THE ENGINE (the vendored goldens), rather
// than restating a formula here.

import fs from 'node:fs';
import path from 'node:path';
import {
  monthsBetween, addMonths, monthEnd, monthKeyOf, eventMonth, firstDataMonth,
  exposureByMonth, reportsByMonth, buildSeries, computeRates,
  rollingFromSeries, uChartFromSeries, compareSelections,
} from './aggregate';
import { METRICS, metricById, RATE_BASES, basisFor } from './definitions';

const GOLDEN = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../../../packages/engines/test-data/hse/goldens/safetyStats_cases.json'), 'utf8',
));
const golden = (id) => GOLDEN.cases.find((c) => c.id === id);

let seq = 0;
/** n reports of one class, dated mid-month so no time zone can move them. */
const reports = (n, month, fields = {}) => Array.from({ length: n }, () => ({
  id: `r${(seq += 1)}`,
  status: 'submitted',
  created_at: `${month}-15T12:00:00Z`,
  site_id: null,
  ...fields,
}));
const hoursRow = (month, hours, fields = {}) => ({ period_start: `${month}-01`, period_end: monthEnd(month), hours, workforce: 'combined', site_id: null, ...fields });

/** One recordable (medical treatment) report per event, one hours row per month. */
const seriesFrom = ({ counts, exposureHours, start = '2025-01', cls = 'medical_treatment' }) => {
  const months = counts.map((_, i) => addMonths(start, i));
  return {
    months,
    reports: months.flatMap((m, i) => reports(counts[i], m, { injury_classification: cls })),
    exposure: months.flatMap((m, i) => (exposureHours[i] > 0 ? [hoursRow(m, exposureHours[i])] : [])),
  };
};

const close = (a, b, rel = 1e-12) => expect(Math.abs(a - b)).toBeLessThanOrEqual(rel * Math.max(1, Math.abs(b)));

describe('months', () => {
  test('ranges cross a year end and February knows leap years', () => {
    expect(monthsBetween('2025-11', '2026-02')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
    expect(monthsBetween('2026-03', '2026-02')).toEqual([]);
    expect(addMonths('2025-12', 1)).toBe('2026-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthEnd('2028-02')).toBe('2028-02-29');
    expect(monthEnd('2026-02')).toBe('2026-02-28');
  });

  test('an event belongs to the month it occurred, falling back to the report date', () => {
    expect(eventMonth({ occurred_on: '2026-01-31', created_at: '2026-02-02T09:00:00Z' })).toBe('2026-01');
    expect(eventMonth({ created_at: '2026-02-15T12:00:00Z' })).toBe('2026-02');
    expect(monthKeyOf('not a date')).toBeNull();
  });

  test('firstDataMonth looks at both reports and hours', () => {
    expect(firstDataMonth(reports(1, '2026-03'), [hoursRow('2025-11', 10)])).toBe('2025-11');
    expect(firstDataMonth([], [])).toBeNull();
  });
});

describe('exposure hours per month', () => {
  test('a month without a row has no hours, never zero', () => {
    const { byMonth } = exposureByMonth([hoursRow('2026-01', 1000)]);
    expect(byMonth.get('2026-01')).toBe(1000);
    expect(byMonth.has('2026-02')).toBe(false);
  });

  test('combined view sums employee and contractor rows', () => {
    const { byMonth, warnings } = exposureByMonth([
      hoursRow('2026-01', 700, { workforce: 'employee' }),
      hoursRow('2026-01', 300, { workforce: 'contractor' }),
    ]);
    expect(byMonth.get('2026-01')).toBe(1000);
    expect(warnings).toEqual([]);
  });

  test('a combined row beside split rows is used alone and flagged, never added twice', () => {
    const { byMonth, warnings } = exposureByMonth([
      hoursRow('2026-01', 1000),
      hoursRow('2026-01', 700, { workforce: 'employee' }),
    ]);
    expect(byMonth.get('2026-01')).toBe(1000);
    expect(warnings).toEqual([{ type: 'combined-and-split', month: '2026-01', siteId: null }]);
  });

  test('the employee view cannot use a combined-only month, and says so', () => {
    const { byMonth, warnings } = exposureByMonth([hoursRow('2026-01', 1000)], { workforce: 'employee' });
    expect(byMonth.has('2026-01')).toBe(false);
    expect(warnings[0]).toMatchObject({ type: 'combined-only', month: '2026-01', workforce: 'employee' });
  });

  test('site filter: one site, the unattributed bucket, or all of them added', () => {
    const rows = [hoursRow('2026-01', 100, { site_id: 'A' }), hoursRow('2026-01', 50, { site_id: 'B' }), hoursRow('2026-01', 5)];
    expect(exposureByMonth(rows, { siteId: 'A' }).byMonth.get('2026-01')).toBe(100);
    expect(exposureByMonth(rows, { siteId: 'unattributed' }).byMonth.get('2026-01')).toBe(5);
    expect(exposureByMonth(rows).byMonth.get('2026-01')).toBe(155);
  });

  test('numeric hours arriving as strings are read as numbers', () => {
    expect(exposureByMonth([hoursRow('2026-01', '1234.5')]).byMonth.get('2026-01')).toBe(1234.5);
  });
});

describe('classifying reports into counts', () => {
  test('each class feeds the right counts; unclassified is its own count', () => {
    const rows = [
      ...reports(1, '2026-01', { injury_classification: 'fatality' }),
      ...reports(2, '2026-01', { injury_classification: 'lost_time', days_away: 4 }),
      ...reports(1, '2026-01', { injury_classification: 'restricted' }),
      ...reports(3, '2026-01', { injury_classification: 'medical_treatment' }),
      ...reports(5, '2026-01', { injury_classification: 'first_aid' }),
      ...reports(2, '2026-01', { injury_classification: 'near_miss' }),
      ...reports(4, '2026-01'),
    ];
    const c = reportsByMonth(rows).get('2026-01');
    expect(c).toMatchObject({
      reports: 18, classified: 14, unclassified: 4,
      recordable: 7, dart: 3, lti: 3, fatality: 1, daysAway: 8, lostTimeMissingDays: 0,
    });
  });

  test('a lost time case without days is flagged, not counted as zero days', () => {
    const c = reportsByMonth(reports(1, '2026-01', { injury_classification: 'lost_time' })).get('2026-01');
    expect(c.daysAway).toBe(0);
    expect(c.lostTimeMissingDays).toBe(1);
  });

  test('drafts are not reports yet', () => {
    const c = reportsByMonth(reports(3, '2026-01', { status: 'draft', injury_classification: 'fatality' }));
    expect(c.size).toBe(0);
  });

  test('workforce view: other workforce skipped, unknown workforce flagged, PSE only in the combined view', () => {
    const rows = [
      ...reports(2, '2026-01', { injury_classification: 'lost_time', days_away: 1, workforce: 'employee', pse_classification: 'tier_1' }),
      ...reports(3, '2026-01', { injury_classification: 'lost_time', days_away: 1, workforce: 'contractor' }),
      ...reports(1, '2026-01', { injury_classification: 'medical_treatment' }),
      ...reports(1, '2026-01'),
    ];
    const emp = reportsByMonth(rows, { workforce: 'employee' }).get('2026-01');
    expect(emp).toMatchObject({ reports: 4, recordable: 2, workforceUnknown: 1, unclassified: 1, pse1: 0, pseUnassessed: 0 });
    const all = reportsByMonth(rows).get('2026-01');
    expect(all).toMatchObject({ reports: 7, recordable: 6, workforceUnknown: 0, pse1: 2, pseAssessed: 2, pseUnassessed: 5 });
  });

  test('site filter applies to reports too', () => {
    const rows = [...reports(2, '2026-01', { site_id: 'A', injury_classification: 'first_aid' }), ...reports(1, '2026-01', { injury_classification: 'first_aid' })];
    expect(reportsByMonth(rows, { siteId: 'A' }).get('2026-01').reports).toBe(2);
    expect(reportsByMonth(rows, { siteId: 'unattributed' }).get('2026-01').reports).toBe(1);
  });
});

describe('series and rates through the engine', () => {
  const trir = metricById('trir');
  const dart = metricById('dart');

  test('BLS published example: 7 recordables and 3 DART cases over 400,000 hours give 3.5 and 1.5 per 200,000', () => {
    const rows = [
      ...reports(3, '2026-01', { injury_classification: 'lost_time', days_away: 2 }),
      ...reports(4, '2026-01', { injury_classification: 'medical_treatment' }),
    ];
    const s = buildSeries({ reports: rows, exposure: [hoursRow('2026-01', 400000)], from: '2026-01', to: '2026-01' });
    const [t, d] = computeRates(s, [trir, dart], { base: RATE_BASES.OSHA_200K });
    expect(t.status).toBe('ok');
    close(t.rate, golden('bls-trir-abc-company').expected.rate);
    expect(t.rate.toFixed(1)).toBe('3.5');
    close(d.rate, golden('bls-dart-abc-company').expected.rate);
    expect(d.rate.toFixed(1)).toBe('1.5');
    expect(t.interval.lower).toBeLessThan(t.rate);
    expect(t.interval.upper).toBeGreaterThan(t.rate);
    expect(t.basis.baseLabel).toMatch(/200,000/);
  });

  test('unclassified reports change no rate and are reported beside it', () => {
    const base = [...reports(7, '2026-01', { injury_classification: 'medical_treatment' })];
    const exposure = [hoursRow('2026-01', 400000)];
    const without = computeRates(buildSeries({ reports: base, exposure, from: '2026-01', to: '2026-01' }), [trir], { base: RATE_BASES.OSHA_200K })[0];
    const withUnclassified = computeRates(buildSeries({ reports: [...base, ...reports(5, '2026-01')], exposure, from: '2026-01', to: '2026-01' }), [trir], { base: RATE_BASES.OSHA_200K })[0];
    expect(withUnclassified.rate).toBe(without.rate);
    expect(withUnclassified.unclassified).toBe(5);
    expect(without.unclassified).toBe(0);
  });

  test('no hours at all: every rate says so, none reads zero', () => {
    const s = buildSeries({ reports: reports(2, '2026-01', { injury_classification: 'fatality' }), exposure: [], from: '2026-01', to: '2026-03' });
    const rates = computeRates(s, METRICS, { base: RATE_BASES.IOGP_1M });
    for (const r of rates) {
      expect(r.status).toBe('no-hours');
      expect(r.rate).toBeUndefined();
    }
    expect(s.monthsWithoutHours).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(s.months.every((m) => m.hours === null)).toBe(true);
  });

  test('events in a month without hours are left out of the rate and counted as outside', () => {
    const rows = [...reports(2, '2026-01', { injury_classification: 'medical_treatment' }), ...reports(3, '2026-02', { injury_classification: 'medical_treatment' })];
    const s = buildSeries({ reports: rows, exposure: [hoursRow('2026-01', 100000)], from: '2026-01', to: '2026-02' });
    const [t] = computeRates(s, [trir], { base: RATE_BASES.IOGP_1M });
    expect(t.count).toBe(2);
    expect(t.outsideHours).toBe(3);
    close(t.rate, 20);
  });

  test('pooled over months is sum-then-divide: the oracle pooled-12-months golden', () => {
    const g = golden('pooled-12-months');
    const { reports: rows, exposure, months } = seriesFrom(g.args);
    const s = buildSeries({ reports: rows, exposure, from: months[0], to: months[months.length - 1] });
    const [t] = computeRates(s, [trir], { base: g.args.base });
    close(t.rate, g.expected.rate);
    expect(t.count).toBe(g.expected.count);
    close(t.exposureHours, g.expected.exposureHours);
    expect(s.monthsWithoutHours).toHaveLength(g.expected.periodsWithoutHours);
  });

  test('LTIF is always per 1,000,000 hours and FAR per 100,000,000, whatever base is picked', () => {
    const rows = reports(1, '2026-01', { injury_classification: 'fatality' });
    const s = buildSeries({ reports: rows, exposure: [hoursRow('2026-01', 1000000)], from: '2026-01', to: '2026-01' });
    const [l, f] = computeRates(s, [metricById('ltif'), metricById('far')], { base: RATE_BASES.OSHA_200K });
    expect(l.base).toBe(1e6);
    close(l.rate, 1);
    expect(f.base).toBe(1e8);
    close(f.rate, 100);
  });

  test('the severity rate sums days away and carries no interval', () => {
    const rows = reports(2, '2026-01', { injury_classification: 'lost_time', days_away: 10 });
    const s = buildSeries({ reports: rows, exposure: [hoursRow('2026-01', 200000)], from: '2026-01', to: '2026-01' });
    const [sev] = computeRates(s, [metricById('severity')], { base: RATE_BASES.OSHA_200K });
    close(sev.rate, 20);
    expect(sev.interval).toBeNull();
  });

  test('PSE rates: tier counts in the combined view, not applicable in a workforce view', () => {
    const rows = reports(2, '2026-01', { pse_classification: 'tier_1', injury_classification: 'no_injury', workforce: 'employee' });
    const exposure = [hoursRow('2026-01', 1000000, { workforce: 'employee' })];
    const combined = computeRates(buildSeries({ reports: rows, exposure, from: '2026-01', to: '2026-01' }), [metricById('pse1')], { base: RATE_BASES.IOGP_1M })[0];
    close(combined.rate, 2);
    const emp = computeRates(buildSeries({ reports: rows, exposure, from: '2026-01', to: '2026-01', workforce: 'employee' }), [metricById('pse1')], { base: RATE_BASES.IOGP_1M })[0];
    expect(emp.status).toBe('not-applicable');
  });
});

describe('rolling 12-month rate', () => {
  const trir = metricById('trir');

  test('reproduces the oracle rolling-12-month-zero-hour-month golden, including the mean of monthly rates', () => {
    const g = golden('rolling-12-month-zero-hour-month');
    const { reports: rows, exposure, months } = seriesFrom(g.args);
    const s = buildSeries({ reports: rows, exposure, from: months[0], to: months[months.length - 1] });
    const r = rollingFromSeries(s, trir, { base: g.args.base, windowMonths: g.args.windowPeriods });
    expect(r.status).toBe('ok');
    expect(r.windows).toHaveLength(g.expected.windows.length);
    r.windows.forEach((w, i) => {
      const e = g.expected.windows[i];
      close(w.rate, e.rate);
      close(w.meanOfPeriodRates, e.meanOfPeriodRates);
      expect(w.count).toBe(e.count);
      expect(w.periodsWithoutHours).toBe(e.periodsWithoutHours);
      expect(w.month).toBe(months[e.endIndex]);
    });
    // the lesson the engine's FINDINGS draws: the mean of monthly rates is a different number
    expect(r.windows[r.windows.length - 1].meanOfPeriodRates).not.toBeCloseTo(r.windows[r.windows.length - 1].rate, 1);
  });

  test('events in a month with no hours are excluded and counted, not refused', () => {
    const counts = Array(12).fill(0);
    const exposureHours = Array(12).fill(10000);
    const { reports: rows, exposure, months } = seriesFrom({ counts, exposureHours });
    const extra = reports(2, addMonths(months[11], 1), { injury_classification: 'medical_treatment' });
    const s = buildSeries({ reports: [...rows, ...extra], exposure, from: months[0], to: addMonths(months[11], 1) });
    const r = rollingFromSeries(s, trir, { base: RATE_BASES.IOGP_1M });
    expect(r.status).toBe('ok');
    expect(r.excludedEvents).toBe(2);
    expect(r.windows[1].count).toBe(0);
  });

  test('fewer months than the window says so', () => {
    const s = buildSeries({ reports: [], exposure: [hoursRow('2026-01', 1)], from: '2026-01', to: '2026-06' });
    expect(rollingFromSeries(s, trir, { base: RATE_BASES.IOGP_1M })).toMatchObject({ status: 'too-short', needed: 12, have: 6 });
  });
});

describe('u-chart', () => {
  const trir = metricById('trir');

  test('reproduces the oracle uchart-one-high-month golden and names the month that signals', () => {
    const g = golden('uchart-one-high-month');
    const { reports: rows, exposure, months } = seriesFrom(g.args);
    const s = buildSeries({ reports: rows, exposure, from: months[0], to: months[months.length - 1] });
    const u = uChartFromSeries(s, trir, { base: g.args.base });
    expect(u.status).toBe('ok');
    close(u.centre, g.expected.centre);
    u.points.forEach((p, i) => {
      close(p.ucl, g.expected.points[i].ucl);
      close(p.lcl, g.expected.points[i].lcl);
      expect(p.signal).toBe(g.expected.points[i].signal);
    });
    const signalling = g.expected.points.filter((p) => p.signal).map((p) => months[p.index]);
    expect(u.outOfControl).toEqual(signalling);
  });

  test('months without hours are skipped and listed; the chart is refused when there are no events', () => {
    const s = buildSeries({ reports: [], exposure: [hoursRow('2026-01', 1000), hoursRow('2026-03', 1000)], from: '2026-01', to: '2026-03' });
    const u = uChartFromSeries(s, trir, { base: RATE_BASES.IOGP_1M });
    expect(u.status).toBe('refused');
    expect(u.skippedMonths).toEqual(['2026-02']);
  });

  test('severity has no u-chart', () => {
    const s = buildSeries({ reports: [], exposure: [hoursRow('2026-01', 1000)], from: '2026-01', to: '2026-01' });
    expect(uChartFromSeries(s, metricById('severity'), { base: RATE_BASES.IOGP_1M }).status).toBe('not-applicable');
  });
});

describe('comparing two selections', () => {
  test('reproduces the oracle compare-small-counts golden from two sites', () => {
    const g = golden('compare-small-counts');
    const rows = [
      ...reports(g.args.count1, '2026-01', { site_id: 'A', injury_classification: 'medical_treatment' }),
      ...reports(g.args.count2, '2026-01', { site_id: 'B', injury_classification: 'restricted' }),
    ];
    const exposure = [hoursRow('2026-01', g.args.exposureHours1, { site_id: 'A' }), hoursRow('2026-01', g.args.exposureHours2, { site_id: 'B' })];
    const r = compareSelections({
      reports: rows, exposure, metricId: 'trir', base: RATE_BASES.OSHA_200K, confidence: g.args.confidence,
      a: { from: '2026-01', to: '2026-01', siteId: 'A' },
      b: { from: '2026-01', to: '2026-01', siteId: 'B' },
    });
    expect(r.status).toBe('ok');
    close(r.comparison.pValue, g.expected.pValue, 1e-10);
    close(r.comparison.rateRatio, g.expected.rateRatio);
    close(r.comparison.rateRatioLower, g.expected.rateRatioLower, 1e-10);
    close(r.comparison.rateRatioUpper, g.expected.rateRatioUpper, 1e-10);
  });

  test('a side without hours makes the comparison incomplete, not a zero', () => {
    const r = compareSelections({
      reports: reports(1, '2026-01', { injury_classification: 'medical_treatment' }), exposure: [hoursRow('2026-01', 1000)],
      metricId: 'trir', base: RATE_BASES.IOGP_1M,
      a: { from: '2026-01', to: '2026-01', siteId: 'all' },
      b: { from: '2025-01', to: '2025-12', siteId: 'all' },
    });
    expect(r.status).toBe('incomplete');
  });
});

describe('definitions', () => {
  test('every metric has an engine basis with a base label', () => {
    for (const m of METRICS) {
      const b = basisFor(m, RATE_BASES.IOGP_1M);
      expect(b).toBeTruthy();
      expect(b.baseLabel).toMatch(/^per /);
    }
  });
});
