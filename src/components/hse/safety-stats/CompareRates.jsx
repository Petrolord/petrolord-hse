import React, { useMemo, useState } from 'react';
import { compareSelections } from '@/lib/safetyStats/aggregate';
import { METRICS } from '@/lib/safetyStats/definitions';
import { Pick, MonthField, Notice, fmtMonth, fmtRate, fmtHours, fmtInt } from './common';

const COUNT_METRICS = METRICS.filter((m) => m.kind !== 'days');

const describe = (sel, siteName) => `${fmtMonth(sel.from)} to ${fmtMonth(sel.to)}, ${siteName(sel.siteId)}`;

function SelectionEditor({ title, value, onChange, siteOptions }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <div className="rounded-xl border border-pl-border bg-pl-surface p-4 space-y-3 shadow-pl-sm">
      <div className="text-sm font-semibold text-pl-text">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MonthField label="From" value={value.from} onChange={set('from')} max={value.to} />
        <MonthField label="To" value={value.to} onChange={set('to')} min={value.from} />
      </div>
      <Pick label="Site" value={value.siteId} onChange={set('siteId')} options={siteOptions} />
    </div>
  );
}

function SideResult({ label, side, siteName }) {
  const r = side.rate;
  return (
    <div className="rounded-lg border border-pl-border bg-pl-sunken p-3 text-xs space-y-1 tabular-nums">
      <div className="text-pl-muted">{label}: {describe(side.selection, siteName)}</div>
      {r.status === 'ok' ? (
        <>
          <div className="font-pl-mono text-xl font-semibold text-pl-text">{fmtRate(r.rate)} <span className="font-pl-sans text-xs font-normal text-pl-muted">{r.basis.baseLabel}</span></div>
          <div className="font-pl-mono text-pl-text">{Math.round(r.interval.confidence * 100)}% interval {fmtRate(r.interval.lower)} to {fmtRate(r.interval.upper)}</div>
          <div className="font-pl-mono text-pl-muted">{fmtInt(r.count)} events over {fmtHours(r.exposureHours)} h</div>
        </>
      ) : (
        <div className="text-pl-text">{r.reason}</div>
      )}
      {r.unclassified > 0 && <div className="text-pl-warning-text">{fmtInt(r.unclassified)} {r.unclassified === 1 ? 'report' : 'reports'} unclassified and left out</div>}
      {r.outsideHours > 0 && <div className="text-pl-warning-text">{fmtInt(r.outsideHours)} {r.outsideHours === 1 ? 'event' : 'events'} in months without hours, left out</div>}
    </div>
  );
}

/** Two periods or two sites, one metric: each side's rate and the engine's exact test. */
export default function CompareRates({ reports, exposure, workforce, base, siteOptions, siteName, defaultA, defaultB }) {
  const [metricId, setMetricId] = useState('trir');
  const [a, setA] = useState(defaultA);
  const [b, setB] = useState(defaultB);

  const result = useMemo(
    () => compareSelections({ reports, exposure, a, b, workforce, metricId, base }),
    [reports, exposure, a, b, workforce, metricId, base],
  );
  const c = result.comparison;
  const conf = 0.95;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Pick
          label="Rate to compare"
          value={metricId}
          onChange={setMetricId}
          options={COUNT_METRICS.map((m) => ({ value: m.id, label: `${m.short}: ${m.name}` }))}
          className="w-full sm:w-auto sm:min-w-[280px]"
        />
        <p className="text-xs text-pl-muted max-w-xl">
          The severity rate is not offered: days away are not independent events, so the exact test does not apply to them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SelectionEditor title="Selection A" value={a} onChange={setA} siteOptions={siteOptions} />
        <SelectionEditor title="Selection B" value={b} onChange={setB} siteOptions={siteOptions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SideResult label="A" side={result.a} siteName={siteName} />
        <SideResult label="B" side={result.b} siteName={siteName} />
      </div>

      {result.status === 'ok' ? (
        <div className="rounded-xl border border-pl-border bg-pl-surface p-4 space-y-2 text-sm shadow-pl-sm">
          <div className="text-pl-text font-semibold">Rate ratio A / B</div>
          <div className="font-pl-mono text-2xl font-semibold text-pl-text tabular-nums">
            {c.rateRatio === null ? 'unbounded' : fmtRate(c.rateRatio)}
          </div>
          <div className="font-pl-mono text-pl-text tabular-nums">
            {Math.round(conf * 100)}% interval {fmtRate(c.rateRatioLower)} to {c.upperUnbounded ? 'unbounded' : fmtRate(c.rateRatioUpper)}
            {' '}· two-sided p = {c.pValue < 0.0001 ? '< 0.0001' : c.pValue.toFixed(4)}
          </div>
          <p className="text-pl-muted text-[13px]">
            {c.pValue < 1 - conf
              ? 'The interval excludes 1: the two rates differ by more than chance alone would usually produce at these hours.'
              : 'The interval includes 1: at these hours the difference is within what chance alone produces. Treat the two rates as indistinguishable until more hours accumulate.'}
          </p>
          {c.reason && <p className="text-pl-warning-text text-xs">{c.reason}</p>}
          <p className="text-[11px] text-pl-muted">Method: {c.basis.method}.</p>
        </div>
      ) : (
        <Notice tone="warn" title="No comparison">{result.reason}</Notice>
      )}
    </div>
  );
}
