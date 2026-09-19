import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { heatInputs, heatRowFromForm, blankHeatForm } from '@/lib/hygiene/forms';
import {
  evaluateHeat, isRefusal, WBGT_FORMS, HEAT_EQUATION_NOTE,
} from '@/lib/hygiene/evaluate';
import { hygieneService } from '@/services/hygieneService';
import { ChartCard, CHART } from '../safety-stats/common';
import {
  Panel, PeriodTable, Pick, TextField, Refusal, Warnings, Flag, Stat, SampleHeader, SERIES, fmt, Notice,
} from './hygieneUi';
import SaveBar from './SaveBar';

const WBGT_COLUMNS = {
  indoor: [
    { key: 'durationMin', label: 'Duration, min' },
    { key: 'naturalWetBulbC', label: 'Natural wet bulb, C' },
    { key: 'globeC', label: 'Globe, C' },
  ],
  outdoor: [
    { key: 'durationMin', label: 'Duration, min' },
    { key: 'naturalWetBulbC', label: 'Natural wet bulb, C' },
    { key: 'globeC', label: 'Globe, C' },
    { key: 'dryBulbC', label: 'Dry bulb (air), C' },
  ],
  measured: [
    { key: 'durationMin', label: 'Duration, min' },
    { key: 'wbgtC', label: 'WBGT, C' },
  ],
};

export { HEAT_EQUATION_NOTE };

export default function HeatTab({ orgId, form, setForm, sites, canSave, saveBlockReason, onSaved }) {
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const inputs = useMemo(() => heatInputs(form), [form]);
  const result = useMemo(() => (isRefusal(inputs) ? null : evaluateHeat(inputs)), [inputs]);
  const a = result?.assessment;

  const chartData = useMemo(() => {
    if (!result || isRefusal(a)) return [];
    return result.periodWbgt.map((p, i) => ({ name: `${i + 1}: ${fmt(p.durationMin, 0)} min`, wbgt: p.wbgtC }));
  }, [result, a]);

  let blocker = saveBlockReason;
  if (!blocker && isRefusal(inputs)) blocker = 'Fix the refused entry to save.';
  if (!blocker && !form.subjectLabel.trim()) blocker = 'Name the worker or exposure group to save.';
  if (!blocker && a && isRefusal(a)) blocker = 'The engine refused this hour; fix it to save.';

  const save = async () => {
    const row = heatRowFromForm(form, inputs);
    const r = await hygieneService.saveHeat(orgId, form.id, row);
    if (!r.error) onSaved('heat', r.data);
    return r;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] gap-4">
      <div className="space-y-4">
        <Panel title="Heat stress assessment" subtitle="One hour of work and rest. The NIOSH limits are 1-hour time-weighted averages, so each table must total 60 minutes.">
          <SampleHeader form={form} setField={setField} sites={sites} dateKey="assessmentDate" dateLabel="Assessment date" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pick label="WBGT" value={form.form} onChange={setField('form')} options={WBGT_FORMS.map((f) => ({ value: f.id, label: f.label }))} />
            <Pick
              label="Worker status"
              value={form.acclimatized ? 'yes' : 'no'}
              onChange={(v) => setField('acclimatized')(v === 'yes')}
              options={[
                { value: 'yes', label: 'Acclimatized: judged against the REL' },
                { value: 'no', label: 'Not acclimatized: judged against the RAL' },
              ]}
            />
          </div>
          <div className="text-xs text-gray-400">WBGT periods</div>
          <PeriodTable
            rows={form.wbgtPeriods}
            onChange={setField('wbgtPeriods')}
            blankRow={() => ({ durationMin: '', naturalWetBulbC: '', globeC: '', dryBulbC: '', wbgtC: '' })}
            columns={WBGT_COLUMNS[form.form] || WBGT_COLUMNS.indoor}
          />
          <div className="text-xs text-gray-400">Metabolic periods (watts; the NIOSH figures span 116 to 580 W)</div>
          <PeriodTable
            rows={form.metabolicPeriods}
            onChange={setField('metabolicPeriods')}
            blankRow={() => ({ durationMin: '', metabolicRateW: '', activity: '' })}
            columns={[
              { key: 'durationMin', label: 'Duration, min' },
              { key: 'metabolicRateW', label: 'Metabolic rate, W' },
              { key: 'activity', label: 'Activity (optional)', type: 'text' },
            ]}
          />
        </Panel>

        <Panel title="Record details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField label="Clothing (optional)" value={form.clothing} onChange={setField('clothing')} placeholder="For example: cotton coveralls" />
            <TextField label="Instrument (optional)" value={form.instrument} onChange={setField('instrument')} />
            <TextField label="Notes (optional)" value={form.notes} onChange={setField('notes')} />
          </div>
          <p className="text-[11px] text-gray-500">
            No clothing adjustment is applied: the clothing field is recorded for the file only.
          </p>
          {canSave !== false && (
            <SaveBar isEdit={!!form.id} blocker={blocker} onSave={save} onNew={() => setForm(blankHeatForm())} savedTitle={form.subjectLabel} />
          )}
        </Panel>
      </div>

      <div className="space-y-4">
        {isRefusal(inputs) ? <Refusal result={inputs} what="Periods" /> : (
          <>
            <Panel title="NIOSH assessment" subtitle={a && !isRefusal(a) ? `Against the ${a.criterion === 'NIOSH_REL' ? 'REL (acclimatized)' : 'RAL (not acclimatized)'}` : null}>
              {result.periodWbgt.filter(isRefusal).map((r) => <Refusal key={r.field} result={r} what="WBGT" />)}
              {isRefusal(a) ? (!result.periodWbgt.some(isRefusal) && <Refusal result={a} what="Assessment" />) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Stat label="Time-weighted WBGT" value={fmt(a.wbgtTwaC, 1)} unit="C" />
                    <Stat label="Time-weighted metabolic rate" value={fmt(a.metabolicRateTwaW, 0)} unit="W" />
                    <Stat label={a.criterion === 'NIOSH_REL' ? 'REL' : 'RAL'} value={fmt(a.limitWbgtC, 1)} unit="C WBGT" />
                    <Stat label="Margin" value={fmt(a.marginC, 1)} unit="C" sub="limit minus WBGT" />
                  </div>
                  <Flag exceeds={a.exceeds} />
                  <Warnings items={a.warnings} />
                  <div className="grid grid-cols-2 gap-2 border-t border-[#2d2d4a] pt-2">
                    <Stat label="RAL at this rate (not acclimatized)" value={fmt(result.ral.limitWbgtC, 1)} unit="C WBGT" />
                    <Stat label="REL at this rate (acclimatized)" value={fmt(result.rel.limitWbgtC, 1)} unit="C WBGT" />
                  </div>
                  <div className="text-[10px] text-gray-500">
                    WBGT: {result.periodWbgt[0]?.source}. Limits: {a.source}.
                  </div>
                </div>
              )}
              <Notice tone="warn" title="About these limits">{HEAT_EQUATION_NOTE}</Notice>
            </Panel>

            {chartData.length > 0 && !isRefusal(a) && (
              <ChartCard title="WBGT by period" subtitle="Each period's WBGT. The dashed line is the limit for the hour's time-weighted metabolic rate.">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: CHART.textSecondary, fontSize: 11 }} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                    <YAxis tick={{ fill: CHART.textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} unit=" C" domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(v) => [`${fmt(v, 1)} C`, 'WBGT']}
                      contentStyle={{ background: '#ffffff', border: `1px solid ${CHART.grid}`, borderRadius: 8, fontSize: 12, color: CHART.text }}
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    />
                    <ReferenceLine
                      y={a.limitWbgtC}
                      stroke={CHART.critical}
                      strokeDasharray="4 3"
                      label={{ value: `${a.criterion === 'NIOSH_REL' ? 'REL' : 'RAL'} ${fmt(a.limitWbgtC, 1)} C`, fill: CHART.textSecondary, fontSize: 11, position: 'insideTopRight' }}
                    />
                    <Bar dataKey="wbgt" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
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
