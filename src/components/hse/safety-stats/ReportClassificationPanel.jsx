import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { quickReportService } from '@/services/quickReportService';
import { isSchemaMissing } from '@/services/safetyStatsService';
import { INJURY_CLASSES, PSE_CLASSES } from '@/lib/safetyStats/definitions';

const NONE = '';

const fromReport = (r) => ({
  injury_classification: r.injury_classification || NONE,
  days_away: r.days_away ?? '',
  days_restricted: r.days_restricted ?? '',
  workforce: r.workforce || NONE,
  pse_classification: r.pse_classification || NONE,
  occurred_on: r.occurred_on || '',
});

// Supervisor View is on the design family (src/design/rollout/w1b.js), so the
// native fields take the Suite field styling on the theme roles.
const selectClass = 'w-full rounded-md border border-pl-border-strong bg-pl-surface p-2 text-xs text-pl-text focus:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus';

const toDays = (v) => (v === '' || v === null ? null : Number(v));

/**
 * Safety statistics classification of one quick report, inside the
 * Supervisor View details dialog. The database lets only a supervisor,
 * manager or admin save it and stamps who did and when.
 */
export default function ReportClassificationPanel({ report, organizationId, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(fromReport(report));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { setForm(fromReport(report)); setError(null); }, [report?.id]);

  const cls = form.injury_classification;
  const showDaysAway = cls === 'lost_time';
  const showDaysRestricted = cls === 'lost_time' || cls === 'restricted';
  const daysAway = showDaysAway ? toDays(form.days_away) : null;
  const daysRestricted = showDaysRestricted ? toDays(form.days_restricted) : null;
  const daysOk = [daysAway, daysRestricted].every((d) => d === null || (Number.isInteger(d) && d >= 0));
  const classInfo = INJURY_CLASSES.find((c) => c.id === cls);

  const save = async () => {
    if (!daysOk) return;
    setSaving(true);
    setError(null);
    const { data, error: err } = await quickReportService.saveClassification(report.id, organizationId, {
      injury_classification: cls || null,
      days_away: daysAway,
      days_restricted: daysRestricted,
      workforce: form.workforce || null,
      pse_classification: form.pse_classification || null,
      occurred_on: form.occurred_on || null,
    });
    setSaving(false);
    if (err) {
      if (isSchemaMissing(err)) setError('Safety statistics are not switched on yet: the HS1 database update has not been applied.');
      else if (err.code === '42501') setError('Only a supervisor, manager or admin of this organization can classify a report.');
      else setError(err.message || 'Could not save the classification.');
      return;
    }
    toast({ title: 'Classification saved' });
    if (onSaved) onSaved(data);
  };

  return (
    <div className="mt-6 pt-4 border-t border-pl-border space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-pl-muted">Safety statistics classification</div>
        {report.classified_at ? (
          <div className="text-[11px] text-pl-success-text">Classified {format(new Date(report.classified_at), 'PP')}</div>
        ) : (
          <div className="text-[11px] text-pl-warning-text">Not classified: counted as unclassified in Safety Statistics</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="sm:col-span-2 text-[11px] text-pl-muted space-y-1">
          <span>Outcome (the most serious that applies)</span>
          <select value={cls} onChange={set('injury_classification')} className={selectClass}>
            <option value={NONE}>Not classified yet</option>
            {INJURY_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}{c.recordable ? ' (recordable)' : ''}</option>
            ))}
          </select>
          {classInfo && <span className="block text-pl-muted">{classInfo.help}</span>}
        </label>

        {showDaysAway && (
          <label className="text-[11px] text-pl-muted space-y-1">
            <span>Calendar days away from work</span>
            <input type="number" min="0" step="1" value={form.days_away} onChange={set('days_away')} className={selectClass} />
          </label>
        )}
        {showDaysRestricted && (
          <label className="text-[11px] text-pl-muted space-y-1">
            <span>Days restricted or transferred</span>
            <input type="number" min="0" step="1" value={form.days_restricted} onChange={set('days_restricted')} className={selectClass} />
          </label>
        )}

        <label className="text-[11px] text-pl-muted space-y-1">
          <span>Workforce</span>
          <select value={form.workforce} onChange={set('workforce')} className={selectClass}>
            <option value={NONE}>Not recorded</option>
            <option value="employee">Employee</option>
            <option value="contractor">Contractor</option>
          </select>
        </label>
        <label className="text-[11px] text-pl-muted space-y-1">
          <span>Date it happened</span>
          <input type="date" value={form.occurred_on} onChange={set('occurred_on')} className={selectClass} />
        </label>

        <label className="sm:col-span-2 text-[11px] text-pl-muted space-y-1">
          <span>Process safety (API RP 754 tier, classified by your organization)</span>
          <select value={form.pse_classification} onChange={set('pse_classification')} className={selectClass}>
            <option value={NONE}>Not assessed</option>
            {PSE_CLASSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
      </div>

      <p className="text-[11px] text-pl-muted">
        When the date it happened is blank, the statistics use the date the report was filed.
        {cls === 'lost_time' && form.days_away === '' && ' A lost time case without days is flagged in the severity rate.'}
      </p>
      {!daysOk && <p className="text-xs text-pl-warning-text">Days must be whole numbers, zero or more.</p>}
      {error && <p className="text-xs text-pl-danger-text">{error}</p>}

      <Button size="sm" onClick={save} disabled={saving || !daysOk} className="text-xs">
        {saving ? 'Saving...' : 'Save classification'}
      </Button>
    </div>
  );
}
