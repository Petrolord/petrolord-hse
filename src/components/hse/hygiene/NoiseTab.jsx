import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { noiseInputs, noiseRowFromForm, blankNoiseForm } from '@/lib/hygiene/forms';
import {
  evaluateNoise, isRefusal, PROTECTOR_METHODS, PROTECTOR_TYPES, EU_NOISE_VALUES, NOISE_CRITERIA,
} from '@/lib/hygiene/evaluate';
import { hygieneService } from '@/services/hygieneService';
import { ChartCard, CHART } from '../safety-stats/common';
import {
  Panel, PeriodTable, Pick, TextField, Refusal, Warnings, Flag, Stat, SampleHeader, SERIES, fmt, Notice,
} from './hygieneUi';
import SaveBar from './SaveBar';

const CRITERION_CHOICES = [
  { value: 'OSHA_PEL', label: NOISE_CRITERIA.OSHA_PEL.label },
  { value: 'OSHA_ACTION_LEVEL', label: NOISE_CRITERIA.OSHA_ACTION_LEVEL.label },
  { value: 'NIOSH_REL', label: NOISE_CRITERIA.NIOSH_REL.label },
  { value: 'EU_LEX', label: 'EU / UK daily exposure LEX,8h' },
];

const SHORT = { OSHA_PEL: 'OSHA PEL', OSHA_ACTION_LEVEL: 'OSHA action level', NIOSH_REL: 'NIOSH REL' };

function CriterionCard({ entry, primary }) {
  const { criterion, result } = entry;
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${primary ? 'border-amber-500/50 bg-amber-500/5' : 'border-[#2d2d4a] bg-[#151524]'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-white">{SHORT[entry.id]}</div>
          <div className="text-[11px] text-gray-500">
            {criterion.criterionLevelDbA} dBA criterion, {criterion.exchangeRateDb} dB exchange rate, {criterion.thresholdDbA} dBA threshold, limit {criterion.limitDosePct}% dose
          </div>
        </div>
        {!isRefusal(result) && <Flag exceeds={result.exceedsLimit} />}
      </div>
      {isRefusal(result) ? <Refusal result={result} /> : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Dose" value={fmt(result.dosePct, 1)} unit="%" />
            <Stat label="8-hour TWA" value={result.twaDbA === null ? '' : fmt(result.twaDbA, 1)} unit="dBA" sub={result.twaDbA === null ? 'no period reaches the threshold' : null} />
          </div>
          <Warnings items={result.warnings} />
        </>
      )}
      <div className="text-[10px] text-gray-500">Source: {criterion.source}</div>
    </div>
  );
}

export default function NoiseTab({ orgId, form, setForm, sites, canSave, saveBlockReason, onSaved }) {
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const inputs = useMemo(() => noiseInputs(form), [form]);
  const result = useMemo(() => (isRefusal(inputs) ? null : evaluateNoise(inputs)), [inputs]);

  const chartData = useMemo(() => {
    if (!result || result.criteria.some((c) => isRefusal(c.result))) return [];
    return inputs.periods.map((p, i) => {
      const row = { name: `${i + 1}: ${p.levelDbA} dBA, ${fmt(p.durationH, 2)} h` };
      result.criteria.forEach((c) => { row[c.id] = c.result.contributions[i].dosePct; });
      return row;
    });
  }, [result, inputs]);

  let blocker = saveBlockReason;
  if (!blocker && isRefusal(inputs)) blocker = 'Fix the refused entry to save.';
  if (!blocker && !form.subjectLabel.trim()) blocker = 'Name the worker or exposure group to save.';
  if (!blocker && result && result.criteria.some((c) => isRefusal(c.result))) blocker = 'The engine refused these periods; fix them to save.';
  if (!blocker && result?.protector?.result && isRefusal(result.protector.result)) blocker = 'The hearing protector estimate was refused; fix it or choose no protector.';

  const save = async () => {
    const row = noiseRowFromForm(form, inputs);
    const r = await hygieneService.saveNoise(orgId, form.id, row);
    if (!r.error) onSaved('noise', r.data);
    return r;
  };

  const lex = result?.lex;
  const al = result?.shiftActionLevel;
  const prot = result?.protector;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-4">
      <div className="space-y-4">
        <Panel title="Noise sample" subtitle="One worker or similar exposure group on one day. Each period is a steady A-weighted level held for its duration.">
          <SampleHeader form={form} setField={setField} sites={sites} dateKey="sampleDate" dateLabel="Sample date" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Pick label="Durations entered in" value={form.durationUnit} onChange={setField('durationUnit')} options={[{ value: 'h', label: 'hours' }, { value: 'min', label: 'minutes' }]} />
            <TextField label="Shift length, hours (optional)" type="number" value={form.shiftHours} onChange={setField('shiftHours')} />
            <Pick label="Record judged against" value={form.criterion} onChange={setField('criterion')} options={CRITERION_CHOICES} />
          </div>
          <PeriodTable
            rows={form.periods}
            onChange={setField('periods')}
            blankRow={() => ({ level: '', duration: '' })}
            columns={[
              { key: 'level', label: 'Level, dBA' },
              { key: 'duration', label: `Duration, ${form.durationUnit === 'min' ? 'minutes' : 'hours'}` },
            ]}
          />
        </Panel>

        <Panel title="Hearing protector (optional)" subtitle="An estimate by a named method. It does not replace a fit test.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pick
              label="Method"
              value={form.protectorMethod}
              onChange={setField('protectorMethod')}
              options={[{ value: 'none', label: 'No protector' }, ...PROTECTOR_METHODS.map((m) => ({ value: m.id, label: m.label }))]}
            />
            <TextField label="Protector (make and model)" value={form.protectorName} onChange={setField('protectorName')} disabled={form.protectorMethod === 'none'} />
            <TextField label={form.protectorMethod === 'OSHA_DUAL' ? 'Higher NRR of the two, dB' : 'Labelled NRR, dB'} type="number" value={form.protectorNrr} onChange={setField('protectorNrr')} disabled={form.protectorMethod === 'none'} />
            <Pick
              label="Exposure weighting"
              value={form.protectorWeighting}
              onChange={setField('protectorWeighting')}
              disabled={form.protectorMethod === 'none'}
              options={[{ value: 'A', label: 'A-weighted (from the periods)' }, { value: 'C', label: 'C-weighted (measured separately)' }]}
            />
            {form.protectorWeighting === 'C' && form.protectorMethod !== 'none' && (
              <TextField label="C-weighted exposure, dBC" type="number" value={form.protectorCLevel} onChange={setField('protectorCLevel')} />
            )}
            {form.protectorMethod === 'NIOSH_TYPE' && (
              <Pick label="Protector type" value={form.protectorType} onChange={setField('protectorType')} options={PROTECTOR_TYPES.map((t) => ({ value: t.id, label: t.label }))} />
            )}
          </div>
        </Panel>

        <Panel title="Record details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Instrument (optional)" value={form.instrument} onChange={setField('instrument')} placeholder="Dosimeter or sound level meter, serial, calibration" />
            <TextField label="Notes (optional)" value={form.notes} onChange={setField('notes')} />
          </div>
          {canSave !== false && (
            <SaveBar
              isEdit={!!form.id}
              blocker={blocker}
              onSave={save}
              onNew={() => setForm(blankNoiseForm())}
              savedTitle={form.subjectLabel}
            />
          )}
        </Panel>
      </div>

      <div className="space-y-4">
        {isRefusal(inputs) ? <Refusal result={inputs} what="Periods" /> : (
          <>
            <Panel title="Dose and TWA, by criterion" subtitle="The same periods against each published criterion, side by side.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.criteria.map((c) => <CriterionCard key={c.id} entry={c} primary={form.criterion === c.id} />)}
              </div>
            </Panel>

            <Panel title="EU / UK daily exposure (LEX,8h)" subtitle="Each period's level taken as its LAeq, normalised to 8 hours.">
              {isRefusal(lex) ? <Refusal result={lex} /> : (
                <div className={`rounded-lg border p-3 space-y-2 ${form.criterion === 'EU_LEX' ? 'border-amber-500/50 bg-amber-500/5' : 'border-[#2d2d4a] bg-[#151524]'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Stat label="LEX,8h" value={fmt(lex.lexDbA, 1)} unit="dB(A)" />
                    <Stat label="Exposure points" value={fmt(lex.exposurePoints, 0)} sub="100 points = 85 dB(A)" />
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">Lower action value {EU_NOISE_VALUES.lowerActionLexDbA}</div>
                      <Flag exceeds={lex.exceedsLowerAction} yes="Reached" no="Below" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">Upper action value {EU_NOISE_VALUES.upperActionLexDbA}</div>
                      <Flag exceeds={lex.exceedsUpperAction} yes="Reached" no="Below" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    The exposure limit value is {EU_NOISE_VALUES.limitLexDbA} dB(A), and the Regulations judge it after the effect of hearing protection.
                    Per period points: {lex.contributions.map((c, i) => `${i + 1}: ${fmt(c.exposurePoints, 0)}`).join(', ')}.
                  </p>
                  <div className="text-[10px] text-gray-500">Source: {EU_NOISE_VALUES.source}; exposure points per HSE L108 Appendix 3</div>
                </div>
              )}
            </Panel>

            {al && (
              <Panel title="OSHA action level for this shift">
                {isRefusal(al) ? <Refusal result={al} /> : (
                  <div className="space-y-1">
                    <Stat label={`Action level for a ${fmt(al.shiftHours, 1)} hour shift`} value={fmt(al.actionLevelDbA, 1)} unit="dBA" />
                    <p className="text-[11px] text-gray-500">
                      A steady level held for the whole shift at this value reaches the 50% action level dose. The OSHA action level dose above
                      already counts every hour of the shift; the PEL is not reduced for a long shift.
                    </p>
                    <div className="text-[10px] text-gray-500">Source: {al.source}</div>
                  </div>
                )}
              </Panel>
            )}

            {prot && (
              <Panel title="Hearing protector estimate">
                {prot.skipped ? <Notice>No estimate: {prot.reason}.</Notice>
                  : isRefusal(prot.result) ? <Refusal result={prot.result} /> : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Stat label="Exposure used" value={fmt(prot.exposureDb, 1)} unit={prot.result.weighting === 'C' ? 'dBC' : 'dBA'} sub={prot.exposureLabel} />
                        <Stat label="Attenuation credited" value={fmt(prot.result.attenuationDb, 1)} unit="dB" sub={prot.result.creditedNrrDb !== undefined ? `credited NRR ${fmt(prot.result.creditedNrrDb, 1)} dB` : null} />
                        <Stat label="Estimated under protector" value={fmt(prot.result.protectedDbA, 1)} unit="dBA" />
                      </div>
                      <Warnings items={prot.result.warnings} />
                      <div className="text-[10px] text-gray-500">Method: {prot.result.method}. Source: {prot.result.source}</div>
                    </div>
                  )}
              </Panel>
            )}

            {chartData.length > 0 && (
              <ChartCard title="Dose contribution by period" subtitle="Percent of each criterion's 100% dose that each period adds. A period below a criterion's threshold adds nothing.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }} barGap={2}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: CHART.textSecondary, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                    <YAxis tick={{ fill: CHART.textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      formatter={(v, name) => [`${fmt(v, 1)}%`, SHORT[name] || name]}
                      contentStyle={{ background: '#ffffff', border: `1px solid ${CHART.grid}`, borderRadius: 8, fontSize: 12, color: CHART.text }}
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    />
                    <Legend formatter={(v) => <span style={{ color: CHART.text }}>{SHORT[v] || v}</span>} />
                    {['OSHA_PEL', 'OSHA_ACTION_LEVEL', 'NIOSH_REL'].map((id, i) => (
                      <Bar key={id} dataKey={id} fill={SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    ))}
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
