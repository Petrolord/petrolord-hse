import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

// A KPI tile on the theme roles (design family, batch 2A): label, mono value
// and a neutral icon. The title names what is counted, so no hue is needed.
// `color` is accepted for callers that still pass it and is ignored.
// Counts and amounts read in the mono face; a word ("No data yet") does not.
const isNumeric = (v) => typeof v === 'number' || /^[\d.,\s-]+$/.test(String(v));

// eslint-disable-next-line no-unused-vars
export default function StatCard({ title, value, unit, icon: Icon, color, trend }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-pl-muted uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {isNumeric(value)
              ? <h3 className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{value}</h3>
              : <h3 className="text-sm font-medium text-pl-muted">{value}</h3>}
            {unit && <span className="text-xs text-pl-muted">{unit}</span>}
          </div>
          {trend && <p className={`text-xs mt-1 ${trend > 0 ? 'text-pl-danger-text' : 'text-pl-success-text'}`}>{trend > 0 ? 'Up' : 'Down'} <span className="font-pl-mono tabular-nums">{trend > 0 ? '+' : ''}{trend}%</span> vs last month</p>}
        </div>
        {Icon && (
          <div className="hidden sm:block shrink-0 p-2.5 rounded-lg bg-pl-sunken border border-pl-border text-pl-muted">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
