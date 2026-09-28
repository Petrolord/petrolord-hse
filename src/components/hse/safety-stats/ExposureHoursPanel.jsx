import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { safetyStatsService, describeSaveError } from '@/services/safetyStatsService';
import { WORKFORCES } from '@/lib/safetyStats/definitions';
import { monthKeyOf } from '@/lib/safetyStats/aggregate';
import { Pick, MonthField, Notice, fmtMonth, fmtHours, currentMonthKey, controlClass, fieldClass } from './common';

const NO_SITE = 'none';
const workforceLabel = (id) => (WORKFORCES.find((w) => w.id === id) || {}).label || id;

const blank = () => ({ id: null, month: currentMonthKey(), siteId: NO_SITE, workforce: 'combined', hours: '', headcount: '', source: '', notes: '' });

function HoursForm({ open, initial, sites, onClose, onSaved, orgId }) {
  const { toast } = useToast();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => { setForm(initial); setError(null); }, [initial]);

  const hours = Number(form.hours);
  const headcount = form.headcount === '' ? null : Number(form.headcount);
  const valid = Number.isFinite(hours) && hours > 0 && (headcount === null || (Number.isInteger(headcount) && headcount >= 0));

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    const { error: err } = await safetyStatsService.saveExposureHours(orgId, {
      id: form.id,
      month: form.month,
      siteId: form.siteId === NO_SITE ? null : form.siteId,
      hours,
      headcount,
      workforce: form.workforce,
      source: form.source.trim(),
      notes: form.notes.trim(),
    });
    setSaving(false);
    if (err) {
      setError(describeSaveError(err));
      return;
    }
    toast({ title: form.id ? 'Hours updated' : 'Hours added', description: `${fmtMonth(form.month)}, ${fmtHours(hours)} h` });
    onSaved();
  };

  const siteOptions = [{ value: NO_SITE, label: 'Whole organization (no site)' }, ...sites.map((s) => ({ value: s.id, label: s.name }))];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit exposure hours' : 'Add exposure hours'}</DialogTitle>
          <DialogDescription>
            Hours actually worked in one calendar month, from payroll, timesheets or the contractor's return.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <MonthField label="Month" value={form.month} onChange={set('month')} />
          <Pick label="Workforce" value={form.workforce} onChange={set('workforce')} options={WORKFORCES.map((w) => ({ value: w.id, label: w.label }))} />
          <Pick label="Site" value={form.siteId} onChange={set('siteId')} options={siteOptions} className="sm:col-span-2" />
          <label className="flex flex-col gap-1 text-xs text-pl-muted">
            <span>Hours worked</span>
            <Input type="number" min="0" step="any" value={form.hours} onChange={(e) => set('hours')(e.target.value)} className={controlClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-pl-muted">
            <span>Headcount (optional)</span>
            <Input type="number" min="0" step="1" value={form.headcount} onChange={(e) => set('headcount')(e.target.value)} className={controlClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-pl-muted sm:col-span-2">
            <span>Source (optional)</span>
            <Input value={form.source} placeholder="For example: payroll export, contractor monthly return" onChange={(e) => set('source')(e.target.value)} className={controlClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-pl-muted sm:col-span-2">
            <span>Notes (optional)</span>
            <textarea rows={2} value={form.notes} onChange={(e) => set('notes')(e.target.value)} className={`w-full p-2 ${fieldClass}`} />
          </label>
        </div>
        {form.workforce === 'combined' && (
          <p className="text-[11px] text-pl-muted">
            Enter either one combined figure or separate employee and contractor figures for a month and site. If both exist, the combined figure is used and the statistics flag it.
          </p>
        )}
        {!valid && form.hours !== '' && <p className="text-xs text-pl-warning-text">Hours must be a number above zero; headcount a whole number.</p>}
        {error && <p className="text-xs text-pl-danger-text">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!valid || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Exposure hours per month, site and workforce. Editors add, edit and delete; everyone else reads. */
export default function ExposureHoursPanel({ orgId, rows, sites, canEdit, onChanged }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const siteName = (id) => (id ? (sites.find((s) => s.id === id) || {}).name || 'Removed site' : 'Whole organization');

  const confirmDelete = async () => {
    const { error } = await safetyStatsService.deleteExposureHours(orgId, deleting.id);
    if (error) toast({ title: 'Could not delete', description: describeSaveError(error), variant: 'destructive' });
    else toast({ title: 'Hours deleted' });
    setDeleting(null);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-pl-text">Exposure hours</h3>
          <p className="text-xs text-pl-muted">Every rate is events divided by hours worked. A month without a row here has no rate.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setEditing(blank())}>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" /> Add hours
          </Button>
        )}
      </div>

      {!canEdit && <Notice>Only a supervisor, manager or admin can enter hours. You can read them here.</Notice>}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-pl-border bg-pl-surface px-4 py-12 text-center">
          <Clock className="h-10 w-10 text-pl-muted mb-3" aria-hidden="true" />
          <p className="text-pl-text font-medium">No exposure hours yet</p>
          <p className="text-sm text-pl-muted max-w-md mt-1">
            Add the hours worked for each month. Rates appear for every month that has hours; reports in other months are counted but left out of the rates.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-pl-border bg-pl-surface overflow-x-auto shadow-pl-sm">
          <table className="w-full text-sm">
            <thead className="bg-pl-sunken text-pl-muted uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-left">Site</th>
                <th className="px-4 py-3 text-left">Workforce</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-right">Headcount</th>
                <th className="px-4 py-3 text-left">Source</th>
                {canEdit && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-pl-border">
              {rows.map((r) => (
                <tr key={r.id} className="text-pl-text">
                  <td className="px-4 py-2 whitespace-nowrap text-pl-text">{fmtMonth(monthKeyOf(r.period_start))}</td>
                  <td className="px-4 py-2">{siteName(r.site_id)}</td>
                  <td className="px-4 py-2">{workforceLabel(r.workforce)}</td>
                  <td className="px-4 py-2 text-right font-pl-mono tabular-nums">{fmtHours(r.hours)}</td>
                  <td className="px-4 py-2 text-right font-pl-mono tabular-nums">{r.headcount ?? 'n/a'}</td>
                  <td className="px-4 py-2 text-pl-muted max-w-[220px] truncate" title={[r.source, r.notes].filter(Boolean).join(' | ')}>{r.source || ''}</td>
                  {canEdit && (
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" aria-label="Edit"
                        onClick={() => setEditing({
                          id: r.id, month: monthKeyOf(r.period_start), siteId: r.site_id || NO_SITE, workforce: r.workforce,
                          hours: String(r.hours), headcount: r.headcount ?? '', source: r.source || '', notes: r.notes || '',
                        })}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-pl-danger-text" title="Delete" aria-label="Delete" onClick={() => setDeleting(r)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <HoursForm
          open
          initial={editing}
          sites={sites}
          orgId={orgId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onChanged(); }}
        />
      )}

      {deleting && (
        <Dialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete these hours?</DialogTitle>
              <DialogDescription>
                {fmtMonth(monthKeyOf(deleting.period_start))}, {siteName(deleting.site_id)}, {workforceLabel(deleting.workforce)}: {fmtHours(deleting.hours)} h.
                That month will have no rate until hours are entered again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
