import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS, CHART_SERIES, LEGEND_PROPS, TOOLTIP_STYLE } from '@/utils/chartTheme';

// Design family (batch 2B): the Suite chart standard on a white ChartPanel.
// Each slice takes its colour from its severity name, so the legend word and
// the colour always agree (the colour used to follow the slice's position).
const SEVERITY_COLORS = {
  Critical: CHART_SERIES[3],
  High: CHART_SERIES[2],
  Medium: CHART_SERIES[0],
  Low: CHART_SERIES[1],
};
const colorFor = (name) => SEVERITY_COLORS[name] || CHART_SERIES[4];
// Legend words wear the text colour; the swatch beside them carries identity.
const legendText = (value) => <span style={{ color: CHART_COLORS.legendText }}>{value}</span>;

export default function RiskDistributionChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFor(entry.name)} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend {...LEGEND_PROPS} formatter={legendText} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
