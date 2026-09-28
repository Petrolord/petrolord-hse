import React from 'react';
import { Plus, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CHART_SERIES } from '@/utils/chartTheme';
import { controlClass, Notice, Pick } from '../safety-stats/common';

// Design family (batch 2B): Occupational Hygiene renders inside the signed-in
// scope (src/design/rollout/w2b.js), so these pieces use the theme roles.

export { Notice, Pick, controlClass };

/** Chart series in fixed categorical order (the Suite chart standard, src/utils/chartTheme.js). */
export const SERIES = [CHART_SERIES[0], CHART_SERIES[2], CHART_SERIES[1]];

/** Numbers: 3 significant figures at most, never exponent notation. */
export const fmt = (v, digits = 1) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  return Number(v).toFixed(digits);
};

/** An engine (or form) refusal, shown by the name of the field it refused. */
export const Refusal = ({ result, what }) => (
  <div className="flex gap-2 rounded-lg border border-pl-danger/40 bg-pl-danger-bg p-3 text-sm text-pl-danger-text">
    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
    <div>
      <div className="font-semibold">{what ? `${what}: refused` : 'Refused'}</div>
      <div className="text-[13px] opacity-90">
        <code className="rounded bg-pl-surface/70 px-1 font-pl-mono">{result.field}</code> {result.error}
      </div>
    </div>
  </div>
);

/** The engine's own warning strings, verbatim. */
export const Warnings = ({ items, className }) => {
  if (!items || !items.length) return null;
  return (
    <ul className={cn('space-y-1 text-[12px] text-pl-warning-text', className)}>
      {items.map((w) => <li key={w}>Warning: {w}</li>)}
    </ul>
  );
};

/** Exceeds / within flag: an icon-free word plus colour, never colour alone. */
export const Flag = ({ exceeds, yes = 'Exceeds', no = 'Within' }) => {
  if (exceeds === null || exceeds === undefined) return null;
  return (
    <span className={cn(
      'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
      exceeds ? 'bg-pl-danger-bg text-pl-danger-text border border-pl-danger/40' : 'bg-pl-success-bg text-pl-success-text border border-pl-success/40',
    )}>
      {exceeds ? yes : no}
    </span>
  );
};

export const Field = ({ label, children, className }) => (
  <label className={cn('flex flex-col gap-1 text-xs text-pl-muted', className)}>
    {label && <span>{label}</span>}
    {children}
  </label>
);

export const TextField = ({ label, value, onChange, className, type = 'text', placeholder, disabled }) => (
  <Field label={label} className={className}>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={controlClass}
    />
  </Field>
);

export const Panel = ({ title, subtitle, children, actions, className }) => (
  <div className={cn('rounded-xl border border-pl-border bg-pl-surface p-4 space-y-3 shadow-pl-sm', className)}>
    {(title || actions) && (
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {title && <h3 className="text-sm font-semibold text-pl-text">{title}</h3>}
          {subtitle && <p className="text-xs text-pl-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </div>
);

/**
 * An editable table of periods. columns: [{ key, label, step }]. Rows are
 * strings; blank rows are skipped by the parser, half-filled rows refused.
 */
export const PeriodTable = ({ rows, columns, onChange, blankRow, disabled, maxRows = 50 }) => {
  const set = (i, key, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-pl-muted">
            <tr>
              <th className="px-1 py-1 text-left w-8">#</th>
              {columns.map((c) => <th key={c.key} className="px-1 py-1 text-left font-normal">{c.label}</th>)}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={i}>
                <td className="px-1 py-1 text-pl-muted font-pl-mono tabular-nums">{i + 1}</td>
                {columns.map((c) => (
                  <td key={c.key} className="px-1 py-1">
                    <Input
                      type={c.type || 'number'}
                      step={c.step || 'any'}
                      value={r[c.key] ?? ''}
                      disabled={disabled}
                      aria-label={`${c.label}, row ${i + 1}`}
                      onChange={(e) => set(i, c.key, e.target.value)}
                      className={cn(controlClass, 'min-w-[90px]')}
                    />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-pl-danger-text"
                    title="Remove row"
                    aria-label="Remove row"
                    disabled={disabled || rows.length <= 1}
                    onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || rows.length >= maxRows}
        onClick={() => onChange([...rows, blankRow()])}
      >
        <Plus className="h-4 w-4 mr-1" aria-hidden="true" /> Add period
      </Button>
    </div>
  );
};

/** Label + value + unit, for a result grid. */
export const Stat = ({ label, value, unit, sub }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-pl-muted">{label}</div>
    <div className="font-pl-mono text-lg font-semibold text-pl-text tabular-nums">
      {value === '' || value === null || value === undefined ? 'n/a' : value}
      {unit && value !== '' && value !== null && value !== undefined && <span className="ml-1 font-pl-sans text-xs font-normal text-pl-muted">{unit}</span>}
    </div>
    {sub && <div className="text-[11px] text-pl-muted">{sub}</div>}
  </div>
);

/** Sample header fields shared by the three tabs. */
export const SampleHeader = ({ form, setField, sites, dateKey, dateLabel, disabled }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <TextField label={dateLabel} type="date" value={form[dateKey]} onChange={setField(dateKey)} disabled={disabled} />
    <Pick
      label="Site"
      value={form.siteId}
      onChange={setField('siteId')}
      disabled={disabled}
      options={[{ value: 'none', label: 'No site' }, ...sites.map((s) => ({ value: s.id, label: s.is_active === false ? `${s.name} (inactive)` : s.name }))]}
    />
    <TextField
      label="Worker or similar exposure group"
      value={form.subjectLabel}
      onChange={setField('subjectLabel')}
      placeholder="For example: Compressor house operators"
      disabled={disabled}
    />
  </div>
);
