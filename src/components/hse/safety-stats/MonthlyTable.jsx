import React from 'react';
import { fmtMonth, fmtHours, fmtInt } from './common';

const Cell = ({ children, muted }) => (
  <td className={`px-3 py-2 text-right tabular-nums font-pl-mono ${muted ? 'text-pl-muted' : 'text-pl-text'}`}>{children}</td>
);

/** The series as a table: the numbers behind every chart, month by month. */
export default function MonthlyTable({ series }) {
  const rows = [...series.months].reverse();
  return (
    <div className="rounded-xl border border-pl-border bg-pl-surface overflow-hidden shadow-pl-sm">
      <div className="px-4 py-3 border-b border-pl-border">
        <h3 className="text-sm font-semibold text-pl-text">Month by month</h3>
        <p className="text-xs text-pl-muted">A month without hours has no rate; its reports are listed but left out of every rate.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-pl-sunken text-pl-muted uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Month</th>
              <th className="px-3 py-2 text-right">Hours</th>
              <th className="px-3 py-2 text-right">Reports</th>
              <th className="px-3 py-2 text-right">Unclassified</th>
              <th className="px-3 py-2 text-right">Recordable</th>
              <th className="px-3 py-2 text-right">DART</th>
              <th className="px-3 py-2 text-right">Lost time + fatal</th>
              <th className="px-3 py-2 text-right">Fatal</th>
              <th className="px-3 py-2 text-right">Days away</th>
              <th className="px-3 py-2 text-right">PSE T1</th>
              <th className="px-3 py-2 text-right">PSE T2</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pl-border">
            {rows.map((m) => {
              const c = m.counts;
              const none = m.hours === null;
              return (
                <tr key={m.month} className={none ? 'bg-pl-sunken/60' : ''}>
                  <td className="px-3 py-2 text-left text-pl-text whitespace-nowrap">{fmtMonth(m.month)}</td>
                  <Cell muted={none}>{none ? 'No hours' : fmtHours(m.hours)}</Cell>
                  <Cell muted={none}>{fmtInt(c.reports)}</Cell>
                  <td className={`px-3 py-2 text-right font-pl-mono tabular-nums ${c.unclassified > 0 ? 'text-pl-warning-text' : 'text-pl-muted'}`}>{fmtInt(c.unclassified)}</td>
                  <Cell muted={none}>{fmtInt(c.recordable)}</Cell>
                  <Cell muted={none}>{fmtInt(c.dart)}</Cell>
                  <Cell muted={none}>{fmtInt(c.lti)}</Cell>
                  <Cell muted={none}>{fmtInt(c.fatality)}</Cell>
                  <Cell muted={none}>{fmtInt(c.daysAway)}{c.lostTimeMissingDays > 0 ? ` (+${c.lostTimeMissingDays} not recorded)` : ''}</Cell>
                  <Cell muted={none}>{series.workforce === 'combined' ? fmtInt(c.pse1) : 'n/a'}</Cell>
                  <Cell muted={none}>{series.workforce === 'combined' ? fmtInt(c.pse2) : 'n/a'}</Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
