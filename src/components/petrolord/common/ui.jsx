import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Shared look for the Environment and Risk modules on the design family
// roles (batch 2A, docs/scope/DesignSystem-Rollout.md). Only these two
// modules import it.

/** The missing-value glyph (the Suite's EMPTY_VALUE). */
export const EMPTY = 'n/a';

/** Module tabs: an underline in the primary role. */
export const moduleTabTriggerClass = 'gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 py-4 text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none';

/** Plain <table> parts that are not the Table primitive. */
export const tableHeadClass = 'bg-pl-sunken text-pl-muted uppercase text-xs';
export const tableBodyClass = 'divide-y divide-pl-border';
export const tableRowClass = 'hover:bg-pl-sunken/60 transition-colors';

/** A toolbar or section header strip. */
export const barClass = 'bg-pl-surface p-4 rounded-lg border border-pl-border';

/**
 * A KPI tile: neutral icon, mono value and a label that names what is
 * counted (so a hue is not needed to say it).
 */
export function KpiTile({ icon: Icon, label, value }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="shrink-0 p-2 rounded-lg bg-pl-sunken border border-pl-border text-pl-muted"><Icon className="h-5 w-5" aria-hidden="true" /></div>
      <div className="min-w-0">
        <div className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text leading-none">{value}</div>
        <div className="text-xs text-pl-muted mt-1">{label}</div>
      </div>
    </Card>
  );
}

/** A progress track with a fill in the given role class. */
export function Track({ pct, fill = 'bg-pl-primary', className = 'h-2', title }) {
  return (
    <div className={`relative ${className} bg-pl-sunken rounded-full overflow-hidden`} title={title}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * A risk score with its rating word on a Badge status variant (the register's
 * bands: 15 and up Critical, 10 High, 5 Medium, below that Low).
 */
export function RiskScoreBadge({ score }) {
  let word = 'Low';
  let variant = 'success';
  if (score >= 15) { word = 'Critical'; variant = 'danger'; }
  else if (score >= 10) { word = 'High'; variant = 'danger'; }
  else if (score >= 5) { word = 'Medium'; variant = 'warning'; }
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      <span className="font-pl-mono tabular-nums mr-1">{score}</span>{word}
    </Badge>
  );
}
