import React, { useMemo, useState } from 'react';
import { FolderOpen, Trash2, Volume2, FlaskConical, Thermometer, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  noiseInputsFromRow, agentInputsFromRow, scheduleFromRow, heatInputsFromRow,
} from '@/lib/hygiene/forms';
import {
  evaluateNoise, evaluateChemicalAgent, evaluateMixture, evaluateHeat, isRefusal,
} from '@/lib/hygiene/evaluate';
import { hygieneService, describeSaveError } from '@/services/hygieneService';
import { Pick, Flag, fmt } from './hygieneUi';

const KIND = {
  noise: { label: 'Noise', icon: Volume2 },
  chemical: { label: 'Chemical', icon: FlaskConical },
  heat: { label: 'Heat', icon: Thermometer },
};

const CRIT_SHORT = { OSHA_PEL: 'OSHA PEL', OSHA_ACTION_LEVEL: 'OSHA action level', NIOSH_REL: 'NIOSH REL', EU_LEX: 'LEX,8h' };

/** One line of results for a stored noise row, against the criterion it was judged by. */
export const summarizeNoise = (row) => {
  const r = evaluateNoise(noiseInputsFromRow(row));
  if (row.criterion === 'EU_LEX') {
    if (isRefusal(r.lex)) return { text: `Refused: ${r.lex.field}`, exceeds: null };
    return {
      text: `LEX,8h ${fmt(r.lex.lexDbA, 1)} dB(A), ${fmt(r.lex.exposurePoints, 0)} points`,
      exceeds: r.lex.exceedsLowerAction,
      yes: r.lex.exceedsUpperAction ? 'Upper action value' : 'Lower action value',
      no: 'Below action values',
    };
  }
  const c = r.criteria.find((x) => x.id === row.criterion) || r.criteria[0];
  if (isRefusal(c.result)) return { text: `Refused: ${c.result.field}`, exceeds: null };
  return {
    text: `${CRIT_SHORT[c.id]}: dose ${fmt(c.result.dosePct, 1)}%${c.result.twaDbA === null ? '' : `, TWA ${fmt(c.result.twaDbA, 1)} dBA`}`,
    exceeds: c.result.exceedsLimit,
  };
};

/** A chemical sample: one or more agent rows (a mixture group). */
export const summarizeChemical = (rows) => {
  const schedule = scheduleFromRow(rows[0]);
  const agents = rows.map(agentInputsFromRow);
  const evs = agents.map((a) => evaluateChemicalAgent(a, schedule));
  const parts = rows.map((r, i) => {
    const ev = evs[i];
    if (isRefusal(ev.twa)) return `${r.agent_name}: refused (${ev.twa.field})`;
    return `${r.agent_name} ${Number(ev.twa.twa8h.toPrecision(3))} ${r.units}${ev.twaLimit !== null ? ` of ${ev.twaLimit}` : ''}`;
  });
  const flags = evs.flatMap((e) => [e.twaExceeds, e.stelExceeds, e.briefScala?.exceeds]).filter((x) => x !== null && x !== undefined);
  let exceeds = flags.length ? flags.some(Boolean) : null;
  if (rows[0].mixture_group_id && rows.length > 1) {
    const m = evaluateMixture(agents, evs);
    if (m.result && !isRefusal(m.result)) {
      parts.push(`mixture index ${Number(m.result.index.toPrecision(3))}`);
      exceeds = exceeds || m.result.exceeds;
    }
  }
  return { text: parts.join('; '), exceeds };
};

export const summarizeHeat = (row) => {
  const r = evaluateHeat(heatInputsFromRow(row));
  const a = r.assessment;
  if (isRefusal(a)) return { text: `Refused: ${a.field}`, exceeds: null };
  return {
    text: `WBGT ${fmt(a.wbgtTwaC, 1)} C at ${fmt(a.metabolicRateTwaW, 0)} W; ${a.criterion === 'NIOSH_REL' ? 'REL' : 'RAL'} ${fmt(a.limitWbgtC, 1)} C`,
    exceeds: a.exceeds,
  };
};

/** Rows from the three tables as one list, newest first; mixture groups as one sample. */
export const buildRecords = ({ noise, chemical, heat }) => {
  const out = [];
  noise.forEach((r) => out.push({ kind: 'noise', key: `n-${r.id}`, date: r.sample_date, rows: [r], ...summarizeNoise(r) }));
  const groups = new Map();
  chemical.forEach((r) => {
    const k = r.mixture_group_id || r.id;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  });
  groups.forEach((rows, k) => out.push({ kind: 'chemical', key: `c-${k}`, date: rows[0].sample_date, rows, ...summarizeChemical(rows) }));
  heat.forEach((r) => out.push({ kind: 'heat', key: `h-${r.id}`, date: r.assessment_date, rows: [r], ...summarizeHeat(r) }));
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
};

export default function RecordsTab({ orgId, records, sites, canEdit, onOpen, onChanged }) {
  const { toast } = useToast();
  const [kind, setKind] = useState('all');
  const [siteId, setSiteId] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const list = useMemo(() => buildRecords(records), [records]);
  const shown = list.filter((r) => (kind === 'all' || r.kind === kind)
    && (siteId === 'all' || (r.rows[0].site_id || 'none') === siteId));
  const siteName = (id) => (id ? (sites.find((s) => s.id === id) || {}).name || 'Removed site' : '');

  const confirmDelete = async () => {
    const { error } = await hygieneService.remove(deleting.kind, orgId, deleting.rows.map((r) => r.id));
    if (error) toast({ title: 'Could not delete', description: describeSaveError(error), variant: 'destructive' });
    else toast({ title: 'Record deleted' });
    setDeleting(null);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#2d2d4a] bg-[#1e1e2d] p-4">
        <Pick label="Type" value={kind} onChange={setKind} className="min-w-[160px]" options={[
          { value: 'all', label: 'All types' }, { value: 'noise', label: 'Noise' }, { value: 'chemical', label: 'Chemical' }, { value: 'heat', label: 'Heat' },
        ]} />
        <Pick label="Site" value={siteId} onChange={setSiteId} className="min-w-[180px]" options={[
          { value: 'all', label: 'All sites' }, { value: 'none', label: 'No site' }, ...sites.map((s) => ({ value: s.id, label: s.name })),
        ]} />
        <div className="text-xs text-gray-400 pb-2">{shown.length} of {list.length} records. Results are recomputed from the stored measurements every time.</div>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2d2d4a] bg-[#1e1e2d] py-12 text-center">
          <ClipboardList className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-white font-medium">No hygiene records yet</p>
          <p className="text-sm text-gray-400 max-w-md mt-1">Enter a noise, chemical or heat measurement on its tab and save it. It will be listed here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2d2d4a] bg-[#1e1e2d] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#252541] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Worker or group</th>
                <th className="px-4 py-3 text-left">Site</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d4a]">
              {shown.map((r) => {
                const K = KIND[r.kind];
                return (
                  <tr key={r.key} className="text-gray-200 align-top">
                    <td className="px-4 py-2 whitespace-nowrap text-white">{r.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap"><K.icon className="inline h-4 w-4 mr-1 text-gray-400" />{K.label}</td>
                    <td className="px-4 py-2">{r.rows[0].subject_label}</td>
                    <td className="px-4 py-2 text-gray-400">{siteName(r.rows[0].site_id)}</td>
                    <td className="px-4 py-2 text-gray-300 max-w-[420px]">{r.text}</td>
                    <td className="px-4 py-2"><Flag exceeds={r.exceeds} yes={r.yes} no={r.no} /></td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" title="Open" onClick={() => onOpen(r.kind, r.rows)}>
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" title="Delete" onClick={() => setDeleting(r)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleting && (
        <Dialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <DialogContent className="bg-[#1a1a2e] text-white border-[#2d2d4a]">
            <DialogHeader>
              <DialogTitle>Delete this record?</DialogTitle>
              <DialogDescription className="text-slate-400">
                {KIND[deleting.kind].label}, {deleting.date}, {deleting.rows[0].subject_label}
                {deleting.rows.length > 1 ? ` (${deleting.rows.length} agents)` : ''}. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
