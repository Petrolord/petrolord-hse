import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import RiskHeatMap from './components/RiskHeatMap';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES, GRID_STYLE, AXIS_PROPS, TOOLTIP_STYLE, LEGEND_PROPS } from '@/utils/chartTheme';

// Charts stay white in both themes (ChartPanel) with the chart theme colours.
const TOOLTIP = {
  contentStyle: TOOLTIP_STYLE,
  itemStyle: { color: CHART_COLORS.tooltipText },
  labelStyle: { color: CHART_COLORS.axisText },
};
// Severity slices from the validated series; the legend names each one.
const RATING_COLORS = { Critical: CHART_SERIES[3], High: CHART_SERIES[2], Medium: CHART_SERIES[0], Low: CHART_SERIES[1] };
const CURSOR = { fill: CHART_COLORS.grid, fillOpacity: 0.4 };

const ratingOf = (score) => {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

function Panel({ title, children }) {
  return (
    <Card className="p-5">
      <h4 className="text-pl-text font-semibold mb-4">{title}</h4>
      {children}
    </Card>
  );
}

export default function RiskAnalytics() {
  const { currentOrganization } = useHSE();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    riskService.getRisks(currentOrganization.id)
      .then(setRisks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const byCategory = useMemo(() => {
    const m = {};
    risks.forEach(r => { const k = r.category || 'Uncategorized'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count }));
  }, [risks]);

  const byRating = useMemo(() => {
    const m = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    risks.forEach(r => { m[r.rating || ratingOf(r.risk_score)]++; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [risks]);

  const byStatus = useMemo(() => {
    const m = {};
    risks.forEach(r => { const k = r.status || 'Unknown'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count }));
  }, [risks]);

  if (loading) return <div className="p-10 text-center text-pl-muted">Crunching risk analytics...</div>;
  if (risks.length === 0) return (
    <div className="p-12 text-center border-2 border-dashed border-pl-border-strong rounded-xl text-pl-muted">
      <h3 className="text-xl font-semibold text-pl-text mb-2">No Data to Analyze</h3>
      <p>Register risks to see distribution, exposure and heat-map analytics.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Risk Exposure Heat Map">
          <div className="h-[320px]"><RiskHeatMap risks={risks} /></div>
        </Panel>

        <ChartPanel title="Severity Distribution" className="p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byRating} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                  {byRating.map((e) => <Cell key={e.name} fill={RATING_COLORS[e.name]} />)}
                </Pie>
                <Tooltip {...TOOLTIP} />
                <Legend {...LEGEND_PROPS} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPanel title="Risks by Category" className="p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="name" {...AXIS_PROPS} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip {...TOOLTIP} cursor={CURSOR} />
                <Bar dataKey="count" name="Risks" fill={CHART_SERIES[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="Risks by Status" className="p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip {...TOOLTIP} cursor={CURSOR} />
                <Bar dataKey="count" name="Risks" fill={CHART_SERIES[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>
    </div>
  );
}
