import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

/** The dark control style the HSE modules use. */
export const controlClass = 'bg-[#151524] border-[#2d2d4a] text-white h-9';

/** A labelled shadcn Select. options: [{ value, label }]. Radix forbids '' as a value. */
export const Pick = ({ label, value, onChange, options, className, triggerClassName, disabled }) => (
  <label className={cn('flex flex-col gap-1 text-xs text-gray-400', className)}>
    {label && <span>{label}</span>}
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn(controlClass, triggerClassName)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#1e1e2d] border-[#2d2d4a] text-gray-200">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </label>
);

export const MonthField = ({ label, value, onChange, min, max, className }) => (
  <label className={cn('flex flex-col gap-1 text-xs text-gray-400', className)}>
    {label && <span>{label}</span>}
    <input
      type="month"
      value={value}
      min={min}
      max={max}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className={cn('rounded-md border px-2 text-sm [color-scheme:dark]', controlClass)}
    />
  </label>
);

export const Notice = ({ tone = 'info', title, children, className }) => {
  const warn = tone === 'warn';
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div className={cn(
      'flex gap-3 rounded-lg border p-3 text-sm',
      warn ? 'border-amber-500/40 bg-amber-500/10 text-amber-100' : 'border-sky-500/30 bg-sky-500/10 text-sky-100',
      className,
    )}>
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', warn ? 'text-amber-400' : 'text-sky-400')} />
      <div className="space-y-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

/** Charts sit on a white card, the Petrolord chart standard. */
export const ChartCard = ({ title, subtitle, children, footer, actions }) => (
  <div className="rounded-xl border border-[#2d2d4a] bg-white text-[#0b0b0b] shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-[#52514e] mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
    <div className="px-2 pb-3 pt-2">{children}</div>
    {footer && <div className="border-t border-[#e7e6e2] px-5 py-3 text-xs text-[#52514e]">{footer}</div>}
  </div>
);

/** Chart ink on the white surface (dataviz reference palette, light mode). */
export const CHART = {
  surface: '#ffffff',
  text: '#0b0b0b',
  textSecondary: '#52514e',
  grid: '#e7e6e2',
  series1: '#2a78d6',
  series2: '#eb6834',
  limit: '#52514e',
  critical: '#d03b3b',
};
