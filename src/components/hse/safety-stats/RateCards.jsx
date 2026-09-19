import React from 'react';
import { fmtRate, fmtHours, fmtInt } from './common';

const pct = (c) => `${Math.round(c * 100)}%`;

const Line = ({ children, tone }) => (
  <div className={tone === 'warn' ? 'text-amber-300' : 'text-gray-400'}>{children}</div>
);

/** One card per rate. A rate that cannot be computed says why; it never shows 0. */
export default function RateCards({ rates }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {rates.map((r) => (
        <div key={r.metric.id} className="rounded-xl border border-[#2d2d4a] bg-[#1e1e2d] p-4 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-white">{r.metric.short}</span>
            <span className="text-[11px] text-gray-500 text-right">{r.metric.name}</span>
          </div>

          {r.status === 'ok' ? (
            <>
              <div className="text-3xl font-bold text-white tabular-nums">{fmtRate(r.rate)}</div>
              <div className="text-[11px] text-gray-400">{r.basis.baseLabel}</div>
              {r.interval ? (
                <div className="text-xs text-gray-300 tabular-nums">
                  {pct(r.interval.confidence)} interval {fmtRate(r.interval.lower)} to {fmtRate(r.interval.upper)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No interval: days away are not independent events.</div>
              )}
            </>
          ) : (
            <div className="py-2 text-sm text-gray-400">
              {r.status === 'no-hours' && <span className="text-lg font-semibold text-gray-300">No hours</span>}
              {r.status === 'not-applicable' && <span className="font-semibold text-gray-300">Not applicable</span>}
              {r.status === 'refused' && <span className="font-semibold text-gray-300">Not computed</span>}
              <div className="text-xs mt-1">{r.reason}</div>
            </div>
          )}

          <div className="mt-auto space-y-0.5 border-t border-[#2d2d4a] pt-2 text-[11px] tabular-nums">
            <Line>
              {r.metric.kind === 'days' ? `${fmtInt(r.count)} days away` : `${fmtInt(r.count)} ${r.count === 1 ? 'event' : 'events'}`}
              {r.exposureHours > 0 && ` over ${fmtHours(r.exposureHours)} h`}
            </Line>
            {r.unclassified > 0 && (
              <Line tone="warn">
                {fmtInt(r.unclassified)} {r.metric.kind === 'pse' ? 'not assessed for PSE' : 'unclassified'} and left out of this rate
              </Line>
            )}
            {r.outsideHours > 0 && (
              <Line tone="warn">{fmtInt(r.outsideHours)} in months without hours, left out</Line>
            )}
            {r.workforceUnknown > 0 && (
              <Line tone="warn">{fmtInt(r.workforceUnknown)} recordable with no workforce recorded, left out</Line>
            )}
            {r.missingDays > 0 && (
              <Line tone="warn">{fmtInt(r.missingDays)} lost time {r.missingDays === 1 ? 'case has' : 'cases have'} no days recorded</Line>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
