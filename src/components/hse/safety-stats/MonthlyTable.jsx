import React from 'react';
import { fmtMonth, fmtHours, fmtInt } from './common';

const Cell = ({ children, muted }) => (
  <td className={`px-3 py-2 text-right tabular-nums ${muted ? 'text-gray-500' : 'text-gray-200'}`}>{children}</td>
);

/** The series as a table: the numbers behind every chart, month by month. */
export default function MonthlyTable({ series }) {
  const rows = [...series.months].reverse();
  return (
    <div className="rounded-xl border border-[#2d2d4a] bg-[#1e1e2d] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d2d4a]">
        <h3 className="text-sm font-semibold text-white">Month by month</h3>
        <p className="text-xs text-gray-400">A month without hours has no rate; its reports are listed but left out of every rate.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#252541] text-gray-400 uppercase">
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
          <tbody className="divide-y divide-[#2d2d4a]">
            {rows.map((m) => {
              const c = m.counts;
              const none = m.hours === null;
              return (
                <tr key={m.month} className={none ? 'bg-[#151524]' : ''}>
                  <td className="px-3 py-2 text-left text-white whitespace-nowrap">{fmtMonth(m.month)}</td>
                  <Cell muted={none}>{none ? 'No hours' : fmtHours(m.hours)}</Cell>
                  <Cell muted={none}>{fmtInt(c.reports)}</Cell>
                  <td className={`px-3 py-2 text-right tabular-nums ${c.unclassified > 0 ? 'text-amber-300' : 'text-gray-500'}`}>{fmtInt(c.unclassified)}</td>
                  <Cell muted={none}>{fmtInt(c.recordable)}</Cell>
                  <Cell muted={none}>{fmtInt(c.dart)}</Cell>
                  <Cell muted={none}>{fmtInt(c.lti)}</Cell>
                  <Cell muted={none}>{fmtInt(c.fatality)}</Cell>
                  <Cell muted={none}>{fmtInt(c.daysAway)}{c.lostTimeMissingDays > 0 ? ` (+${c.lostTimeMissingDays} not recorded)` : ''}</Cell>
                  <Cell muted={none}>{series.workforce === 'combined' ? fmtInt(c.pse1) : ''}</Cell>
                  <Cell muted={none}>{series.workforce === 'combined' ? fmtInt(c.pse2) : ''}</Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
