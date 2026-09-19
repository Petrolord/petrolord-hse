import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { ChartCard, CHART, fmtMonth, fmtRate, fmtHours, Notice } from './common';

const axisProps = {
  tick: { fill: CHART.textSecondary, fontSize: 11 },
  axisLine: { stroke: CHART.grid },
  tickLine: false,
};

const tooltipStyle = {
  contentStyle: { background: '#ffffff', border: `1px solid ${CHART.grid}`, borderRadius: 8, fontSize: 12, color: CHART.text },
  labelStyle: { color: CHART.text, fontWeight: 600 },
};

// legend text wears the text colour; the swatch beside it carries identity
const legendText = (value) => <span style={{ color: CHART.text }}>{value}</span>;

/* ------------------------------------------------------------ rolling */

export function RollingChart({ rolling, metric, baseLabel, from }) {
  if (rolling.status === 'not-applicable') {
    return <Notice title={`Rolling ${metric.short}`}>Process safety event rates use total work hours. Switch the workforce view to employees and contractors.</Notice>;
  }
  if (rolling.status !== 'ok') {
    return <Notice title={`Rolling ${metric.short}`}>{rolling.reason || 'Not enough months for a rolling window.'}</Notice>;
  }
  const windows = rolling.windows.filter((w) => w.month >= from);
  const data = windows.map((w) => ({
    month: w.month,
    label: fmtMonth(w.month),
    rate: w.rate,
    mean: w.meanOfPeriodRates,
    count: w.count,
    hours: w.exposureHours,
    noHours: w.periodsWithoutHours,
  }));
  const empty = data.every((d) => d.rate === null);
  return (
    <ChartCard
      title={`Rolling 12-month ${metric.short}`}
      subtitle={`${baseLabel}. Each point pools the 12 months ending that month: total events over total hours.`}
      footer={(
        <div className="space-y-1">
          <div>The dashed line is the mean of the monthly rates in the same window, shown for contrast. It is a different number: a month with few hours and one event swings it hard. The solid line is the rate to report.</div>
          {rolling.excludedEvents > 0 && <div className="text-[#b54708]">{rolling.excludedEvents} {metric.kind === 'days' ? (rolling.excludedEvents === 1 ? 'day falls' : 'days fall') : (rolling.excludedEvents === 1 ? 'event falls' : 'events fall')} in months without hours and {rolling.excludedEvents === 1 ? 'is' : 'are'} left out.</div>}
        </div>
      )}
    >
      {empty ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-[#52514e]">No 12-month window in this range has exposure hours.</div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={16} />
              <YAxis {...axisProps} width={48} tickFormatter={fmtRate} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [v === null ? 'no hours' : fmtRate(v), name]}
                labelFormatter={(l, p) => {
                  const d = p && p[0] && p[0].payload;
                  return d ? `${l}: ${d.count} over ${fmtHours(d.hours)} h${d.noHours ? `, ${d.noHours} month(s) without hours` : ''}` : l;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={legendText} />
              <Line name="Rolling 12-month rate (pooled)" dataKey="rate" stroke={CHART.series1} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
              <Line name="Mean of monthly rates (contrast only)" dataKey="mean" stroke={CHART.series2} strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

/* ------------------------------------------------------------ u-chart */

const SignalDot = (props) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined) return null;
  if (payload.signal) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={CHART.critical} stroke="#ffffff" strokeWidth={2} />
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize={10} fill={CHART.text}>{payload.signal === 'above' ? 'above UCL' : 'below LCL'}</text>
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill={CHART.series1} stroke="#ffffff" strokeWidth={2} />;
};

export function UChartView({ chart, metric, baseLabel }) {
  if (chart.status === 'not-applicable') return <Notice title={`u-chart, ${metric.short}`}>{chart.reason}</Notice>;
  if (chart.status === 'no-hours') return <Notice title={`u-chart, ${metric.short}`}>No month in this range has exposure hours.</Notice>;
  if (chart.status === 'refused') {
    return (
      <Notice title={`u-chart, ${metric.short}`}>
        No chart: {chart.reason}. With no events there is no centre line to draw limits around.
      </Notice>
    );
  }
  const data = chart.points.map((p) => ({
    label: fmtMonth(p.month), u: p.u, ucl: p.ucl, lcl: p.lcl, count: p.count, hours: p.exposureHours, signal: p.signal,
  }));
  return (
    <ChartCard
      title={`u-chart, monthly ${metric.short}`}
      subtitle={`${baseLabel}. Centre ${fmtRate(chart.centre)}; limits are centre plus or minus three standard errors for each month's hours, the lower one floored at 0.`}
      footer={(
        <div className="space-y-1">
          <div>
            {chart.outOfControl.length === 0
              ? 'No month lies outside its limits: the variation is consistent with a steady underlying rate.'
              : `Outside the limits: ${chart.outOfControl.map(fmtMonth).join(', ')}. Look for a cause in those months.`}
          </div>
          {chart.skippedMonths.length > 0 && <div>Not charted (no hours): {chart.skippedMonths.map(fmtMonth).join(', ')}.</div>}
        </div>
      )}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={16} />
            <YAxis {...axisProps} width={48} tickFormatter={fmtRate} domain={[0, 'auto']} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v, name) => [fmtRate(v), name]}
              labelFormatter={(l, p) => {
                const d = p && p[0] && p[0].payload;
                return d ? `${l}: ${d.count} over ${fmtHours(d.hours)} h` : l;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={legendText} />
            <ReferenceLine y={chart.centre} stroke={CHART.text} strokeWidth={1} label={{ value: 'centre', position: 'right', fontSize: 10, fill: CHART.textSecondary }} />
            <Line name="Upper limit" dataKey="ucl" type="step" stroke={CHART.limit} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            <Line name="Lower limit" dataKey="lcl" type="step" stroke={CHART.limit} strokeWidth={1.5} strokeDasharray="1 3" dot={false} isAnimationActive={false} />
            <Line name={`Monthly ${metric.short}`} dataKey="u" stroke={CHART.series1} strokeWidth={2} dot={<SignalDot />} activeDot={{ r: 6 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
