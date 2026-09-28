import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES } from '@/utils/chartTheme';
import { cn } from '@/lib/utils';

// Design family (batch 2B): Safety Statistics and Occupational Hygiene both
// render inside the signed-in scope (src/design/rollout/w2b.js) and are the
// only users of this file, so it is on the theme roles directly.

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' -> 'Jan 2026' */
export const fmtMonth = (key) => {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
};

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** Three significant figures, no trailing noise, never exponent notation. */
export const fmtRate = (v) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return Number(v.toPrecision(3)).toString();
};

export const fmtHours = (v) => (v === null || v === undefined ? '' : Math.round(Number(v)).toLocaleString());
export const fmtInt = (v) => (v === null || v === undefined ? '' : Number(v).toLocaleString());

/**
 * Height for the kit's Input and SelectTrigger, which take the Suite field
 * styling from the scope. Native fields (month, textarea) use fieldClass.
 */
export const controlClass = 'h-9';

/** The Suite field styling for a native input or textarea on the roles. */
export const fieldClass = 'rounded-md border border-pl-border-strong bg-pl-surface text-sm text-pl-text placeholder:text-pl-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus disabled:cursor-not-allowed disabled:opacity-50';

/** A labelled shadcn Select. options: [{ value, label }]. Radix forbids '' as a value. */
export const Pick = ({ label, value, onChange, options, className, triggerClassName, disabled }) => (
  <label className={cn('flex flex-col gap-1 text-xs text-pl-muted', className)}>
    {label && <span>{label}</span>}
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn(controlClass, triggerClassName)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </label>
);

export const MonthField = ({ label, value, onChange, min, max, className }) => (
  <label className={cn('flex flex-col gap-1 text-xs text-pl-muted', className)}>
    {label && <span>{label}</span>}
    <input
      type="month"
      value={value}
      min={min}
      max={max}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className={cn('h-9 px-2', fieldClass)}
    />
  </label>
);

export const Notice = ({ tone = 'info', title, children, className }) => {
  const warn = tone === 'warn';
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div className={cn(
      'flex gap-3 rounded-lg border p-3 text-sm',
      warn ? 'border-pl-warning/40 bg-pl-warning-bg text-pl-warning-text' : 'border-pl-info/40 bg-pl-info-bg text-pl-info-text',
      className,
    )}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

/**
 * Charts sit on a white ChartPanel (data-canvas="chart"), the Petrolord chart
 * standard, in both themes. The footer carries the reading notes.
 */
export const ChartCard = ({ title, subtitle, children, footer, actions }) => (
  <ChartPanel title={title} subtitle={subtitle} actions={actions}>
    {children}
    {footer && <div className="mt-3 border-t border-pl-border pt-3 text-xs text-pl-muted">{footer}</div>}
  </ChartPanel>
);

/** Chart ink on the white surface, from the Suite chart standard (src/utils/chartTheme.js). */
export const CHART = {
  surface: CHART_COLORS.background,
  text: CHART_COLORS.axisLabel,
  textSecondary: CHART_COLORS.axisText,
  grid: CHART_COLORS.grid,
  series1: CHART_SERIES[0],
  series2: CHART_SERIES[2],
  limit: CHART_COLORS.axisText,
  critical: CHART_SERIES[3],
};
