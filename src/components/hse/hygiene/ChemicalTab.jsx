import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  chemicalInputs, chemicalRowsFromForm, blankChemicalForm, blankAgent, CHEMICAL_UNITS,
} from '@/lib/hygiene/forms';
import {
  evaluateChemicalAgent, evaluateMixture, isRefusal, EXPOSURE_SOURCES,
} from '@/lib/hygiene/evaluate';
import { hygieneService } from '@/services/hygieneService';
import { ChartCard, CHART } from '../safety-stats/common';
import {
  Panel, PeriodTable, Pick, TextField, Refusal, Warnings, Flag, Stat, SampleHeader, SERIES, fmt, Notice,
} from './hygieneUi';
import SaveBar from './SaveBar';

const sig = (v) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  return Number(v.toPrecision(3)).toString();
};

function AgentEditor({ agent, index, onChange, onRemove, canRemove }) {
  const set = (k) => (v) => onChange({ ...agent, [k]: v });
  return (
    <div className="rounded-lg border border-[#2d2d4a] bg-[#151524] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Agent {index + 1}</div>
        <Button variant="ghost" size="sm" disabled={!canRemove} onClick={onRemove} className="text-gray-400 hover:text-red-400">
          <Trash2 className="h-4 w-4 mr-1" /> Remove
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextField label="Agent name" value={agent.agentName} onChange={set('agentName')} placeholder="For example: Toluene" />
        <TextField label="CAS number (optional)" value={agent.casNumber} onChange={set('casNumber')} />
        <Pick label="Units" value={agent.units} onChange={set('units')} options={CHEMICAL_UNITS.map((u) => ({ value: u, label: u }))} />
        <TextField label={`8-hour TWA limit, ${agent.units} (optional)`} type="number" value={agent.twaLimit} onChange={set('twaLimit')} />
        <TextField label={`STEL, ${agent.units} (optional)`} type="number" value={agent.stelLimit} onChange={set('stelLimit')} />
        <TextField label="Limit source" value={agent.limitSource} onChange={set('limitSource')} placeholder="Regulation, table or company standard" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Pick label="Durations entered in" value={agent.durationUnit} onChange={set('durationUnit')} options={[{ value: 'h', label: 'hours' }, { value: 'min', label: 'minutes' }]} />
        <TextField label="Sampling method (optional)" value={agent.samplingMethod} onChange={set('samplingMethod')} className="sm:col-span-2" placeholder="For example: NIOSH 1501, charcoal tube" />
      </div>
      <div className="text-xs text-gray-400">Full-shift periods (for the 8-hour TWA)</div>
      <PeriodTable
        rows={agent.periods}
        onChange={set('periods')}
        blankRow={() => ({ concentration: '', duration: '' })}
        columns={[
          { key: 'concentration', label: `Concentration, ${agent.units}` },
          { key: 'duration', label: `Duration, ${agent.durationUnit === 'min' ? 'minutes' : 'hours'}` },
        ]}
      />
      <div className="text-xs text-gray-400">Short-term periods within one 15-minute window (optional)</div>
      <PeriodTable
        rows={agent.stelPeriods}
        onChange={set('stelPeriods')}
        blankRow={() => ({ concentration: '', durationMin: '' })}
        columns={[
          { key: 'concentration', label: `Concentration, ${agent.units}` },
          { key: 'durationMin', label: 'Duration, minutes' },
        ]}
      />
    </div>
  );
}

function AgentResult({ agent, ev, units }) {
  return (
    <div className="rounded-lg border border-[#2d2d4a] bg-[#151524] p-3 space-y-2">
      <div className="text-sm font-semibold text-white">{agent.agentName}</div>
      {isRefusal(ev.twa) ? <Refusal result={ev.twa} what="8-hour TWA" /> : (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="8-hour TWA" value={sig(ev.twa.twa8h)} unit={units} sub={ev.twaLimit !== null ? `limit ${sig(ev.twaLimit)} ${units}` : 'no TWA limit entered'} />
            <Flag exceeds={ev.twaExceeds} />
          </div>
          <Warnings items={ev.twa.warnings} />
        </div>
      )}
      {ev.stel && (isRefusal(ev.stel) ? <Refusal result={ev.stel} what="STEL" /> : (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="15-minute STEL" value={sig(ev.stel.stel15Min)} unit={units} sub={ev.stelLimit !== null ? `limit ${sig(ev.stelLimit)} ${units}` : 'no STEL entered'} />
            <Flag exceeds={ev.stelExceeds} />
          </div>
          <Warnings items={ev.stel.warnings} />
        </div>
      ))}
      {ev.briefScala && (isRefusal(ev.briefScala.result) ? <Refusal result={ev.briefScala.result} what="Brief and Scala" /> : (
        <div className="space-y-1 border-t border-[#2d2d4a] pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <Stat
              label="Brief and Scala adjusted limit"
              value={sig(ev.briefScala.result.adjustedLimit)}
              unit={units}
              sub={`factor ${sig(ev.briefScala.result.rf)} (${ev.briefScala.result.governingBasis} governs)`}
            />
            {ev.briefScala.shiftAverage !== null && (
              <Stat label="Average over the shift" value={sig(ev.briefScala.shiftAverage)} unit={units} />
            )}
            <Flag exceeds={ev.briefScala.exceeds} />
          </div>
          <p className="text-[11px] text-gray-500">
            The reduced limit is compared with the average over the shift worked. The 8-hour TWA above follows 1910.1000 and divides by 8;
            the two conventions are shown side by side and never combined.
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ChemicalTab({ orgId, form, setForm, sites, canSave, saveBlockReason, onSaved }) {
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const inputs = useMemo(() => chemicalInputs(form), [form]);
  const evals = useMemo(
    () => (isRefusal(inputs) ? null : inputs.agents.map((a) => evaluateChemicalAgent(a, inputs.schedule))),
    [inputs],
  );
  const mixture = useMemo(
    () => (evals && form.additive && inputs.agents.length > 1 ? evaluateMixture(inputs.agents, evals) : null),
    [evals, inputs, form.additive],
  );

  const setAgent = (i) => (a) => setForm((f) => ({ ...f, agents: f.agents.map((x, j) => (j === i ? a : x)) }));
  const removeAgent = (i) => () => setForm((f) => ({
    ...f,
    agents: f.agents.filter((_, j) => j !== i),
    removedIds: f.agents[i].id ? [...(f.removedIds || []), f.agents[i].id] : (f.removedIds || []),
  }));

  const chartData = useMemo(() => {
    if (!evals) return [];
    return inputs.agents
      .map((a, i) => ({ a, ev: evals[i] }))
      .filter(({ ev }) => !isRefusal(ev.twa) && ev.twaLimit !== null)
      .map(({ a, ev }) => ({ name: a.agentName, pct: (100 * ev.twa.twa8h) / ev.twaLimit }));
  }, [evals, inputs]);

  let blocker = saveBlockReason;
  if (!blocker && isRefusal(inputs)) blocker = 'Fix the refused entry to save.';
  if (!blocker && !form.subjectLabel.trim()) blocker = 'Name the worker or exposure group to save.';
  if (!blocker && evals && evals.some((e) => isRefusal(e.twa) || (e.stel && isRefusal(e.stel)))) blocker = 'The engine refused an agent\'s periods; fix them to save.';

  const save = async () => {
    const rows = chemicalRowsFromForm(form, inputs);
    const r = await hygieneService.saveChemicalSample(orgId, rows, form.removedIds || []);
    if (!r.error) onSaved('chemical', r.data);
    return r;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] gap-4">
      <div className="space-y-4">
        <Panel title="Chemical sample" subtitle="Limits are what you enter, with their source. No licensed limit table is built in.">
          <SampleHeader form={form} setField={setField} sites={sites} dateKey="sampleDate" dateLabel="Sample date" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField label="Shift length, hours (optional)" type="number" value={form.shiftHours} onChange={setField('shiftHours')} />
            <TextField label="Hours per week (optional)" type="number" value={form.weeklyHours} onChange={setField('weeklyHours')} />
            <label className="flex items-center gap-2 text-xs text-gray-300 pt-5">
              <Checkbox checked={!!form.additive} onCheckedChange={(v) => setField('additive')(v === true)} />
              These agents have additive effects (mixture)
            </label>
          </div>
          <p className="text-[11px] text-gray-500">
            Shift and weekly hours give the Brief and Scala reduced limit for unusual schedules. The mixture index is only meaningful for agents
            that act on the same organ or system; that judgement is yours.
          </p>
        </Panel>

        {form.agents.map((a, i) => (
          <AgentEditor
            // eslint-disable-next-line react/no-array-index-key
            key={a.id || `new-${i}`}
            agent={a}
            index={i}
            onChange={setAgent(i)}
            onRemove={removeAgent(i)}
            canRemove={form.agents.length > 1}
          />
        ))}
        <Button
          variant="outline"
          onClick={() => setForm((f) => ({ ...f, agents: [...f.agents, blankAgent()] }))}
          className="bg-transparent border-[#3a3a5a] text-gray-300"
          disabled={form.agents.length >= 20}
        >
          <Plus className="h-4 w-4 mr-2" /> Add agent
        </Button>

        <Panel title="Record details">
          <TextField label="Notes (optional)" value={form.notes} onChange={setField('notes')} />
          {canSave !== false && (
            <SaveBar
              isEdit={form.agents.some((a) => a.id)}
              blocker={blocker}
              onSave={save}
              onNew={() => setForm(blankChemicalForm())}
              savedTitle={form.subjectLabel}
            />
          )}
        </Panel>
      </div>

      <div className="space-y-4">
        {isRefusal(inputs) ? <Refusal result={inputs} what="Sample" /> : (
          <>
            <Panel title="Results by agent">
              <div className="space-y-3">
                {inputs.agents.map((a, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <AgentResult key={i} agent={a} ev={evals[i]} units={form.agents[i].units} />
                ))}
              </div>
              <div className="text-[10px] text-gray-500">
                Sources: {EXPOSURE_SOURCES.OSHA_1000_D1} (8-hour TWA); 15-minute TWA for the STEL; {EXPOSURE_SOURCES.BRIEF_SCALA}.
              </div>
            </Panel>

            {form.additive && inputs.agents.length > 1 && mixture && (
              <Panel title="Mixture exposure index" subtitle="Sum of each agent's 8-hour TWA over its TWA limit. Above 1 exceeds.">
                {mixture.result === null ? (
                  <Notice>The index needs at least two agents with a TWA limit and an accepted TWA.</Notice>
                ) : isRefusal(mixture.result) ? <Refusal result={mixture.result} /> : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stat label="Index" value={sig(mixture.result.index)} />
                      <Flag exceeds={mixture.result.exceeds} />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {mixture.components.map((c, k) => `${c.name} ${sig(mixture.result.terms[k])}`).join(' + ')}
                    </p>
                    <div className="text-[10px] text-gray-500">Source: {mixture.result.source}</div>
                  </div>
                )}
                {mixture.excluded.length > 0 && (
                  <p className="text-[11px] text-amber-200">
                    Left out of the index: {mixture.excluded.map((x) => `${x.name} (${x.reason})`).join(', ')}.
                  </p>
                )}
              </Panel>
            )}

            {chartData.length > 0 && (
              <ChartCard title="8-hour TWA as a percent of its limit" subtitle="Each agent against the limit you entered for it. The line is 100%.">
                <ResponsiveContainer width="100%" height={Math.max(160, 48 * chartData.length + 40)}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                    <CartesianGrid stroke={CHART.grid} horizontal={false} />
                    <XAxis type="number" unit="%" tick={{ fill: CHART.textSecondary, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fill: CHART.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [`${fmt(v, 1)}%`, 'of the TWA limit']}
                      contentStyle={{ background: '#ffffff', border: `1px solid ${CHART.grid}`, borderRadius: 8, fontSize: 12, color: CHART.text }}
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    />
                    <ReferenceLine x={100} stroke={CHART.limit} strokeDasharray="4 3" label={{ value: 'limit', fill: CHART.textSecondary, fontSize: 11, position: 'top' }} />
                    <Bar dataKey="pct" fill={SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
