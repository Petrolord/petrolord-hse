import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ShieldAlert, Activity, CheckCircle } from 'lucide-react';
import RiskHeatMap from './components/RiskHeatMap';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES, GRID_STYLE, AXIS_PROPS, TOOLTIP_STYLE } from '@/utils/chartTheme';
import { tableHeadClass, tableBodyClass, tableRowClass, RiskScoreBadge } from '../common/ui';

export default function RiskDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState(null);
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    try {
      const s = await riskService.getDashboardStats(currentOrganization.id);
      const r = await riskService.getRisks(currentOrganization.id); // Get all for heatmap
      setStats(s);
      setRisks(r);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <div className="p-8 text-center text-pl-muted">Loading risk analytics...</div>;

  const categoryData = Object.keys(stats.byCategory).map(k => ({ name: k, value: stats.byCategory[k] }));
  const statusData = Object.keys(stats.byStatus).map(k => ({ name: k, value: stats.byStatus[k] }));
  const topRisks = risks.filter(r => r.risk_score >= 12);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <DashTile icon={AlertTriangle} label="Total Risks Identified" value={stats.total} note={<><Activity className="h-3 w-3 mr-1" aria-hidden="true" /> Active Registry</>} />
        <DashTile icon={ShieldAlert} label="Critical Risks" value={stats.critical} note="Requires immediate action" />
        <DashTile icon={TrendingUp} label="Avg Risk Score" value={stats.avgScore} note="Out of 25 max" />
        <DashTile icon={CheckCircle} label="Mitigation Active" value={statusData.find(d => d.name === 'Mitigated')?.value || 0} note="Risks controlled" />
      </div>

      {/* Main Visuals Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Risk Heat Map</CardTitle></CardHeader>
          <CardContent className="h-[320px]">
            <RiskHeatMap risks={risks} />
          </CardContent>
        </Card>

        {/* Charts */}
        <ChartPanel title="Risk Distribution by Category" className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid {...GRID_STYLE} horizontal={false} />
                <XAxis type="number" {...AXIS_PROPS} allowDecimals={false} />
                <YAxis dataKey="name" type="category" {...AXIS_PROPS} width={100} />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: CHART_COLORS.grid, fillOpacity: 0.4 }}
                />
                <Bar dataKey="value" name="Risks" fill={CHART_SERIES[0]} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      {/* Top Risks Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top Critical Risks (Requiring Action)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3">Risk ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Likelihood</th>
                  <th className="px-4 py-3 text-center">Impact</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody className={tableBodyClass}>
                {topRisks.slice(0, 5).map(risk => (
                  <tr key={risk.id} className={tableRowClass}>
                    <td className="px-4 py-3 font-pl-mono text-xs text-pl-muted">{risk.risk_id}</td>
                    <td className="px-4 py-3 font-medium text-pl-text">{risk.title}</td>
                    <td className="px-4 py-3 text-pl-muted">{risk.category}</td>
                    <td className="px-4 py-3 text-center text-pl-muted font-pl-mono tabular-nums">{risk.likelihood}</td>
                    <td className="px-4 py-3 text-center text-pl-muted font-pl-mono tabular-nums">{risk.impact}</td>
                    <td className="px-4 py-3 text-center">
                      <RiskScoreBadge score={risk.risk_score} />
                    </td>
                    <td className="px-4 py-3 text-pl-muted text-xs">
                      {risk.owner?.raw_user_meta_data?.full_name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
                {topRisks.length === 0 && (
                  <tr><td colSpan="7" className="p-4 text-center text-pl-muted">No critical risks found. Excellent!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// A dashboard KPI tile: neutral icon, mono value and a muted note.
function DashTile({ icon: Icon, label, value, note }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-pl-muted text-xs font-semibold uppercase">{label}</p>
        <div className="shrink-0 p-1.5 rounded-md bg-pl-sunken border border-pl-border text-pl-muted"><Icon className="h-4 w-4" aria-hidden="true" /></div>
      </div>
      <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{value}</h3>
      <p className="text-xs text-pl-muted mt-1 flex items-center">{note}</p>
    </Card>
  );
}
