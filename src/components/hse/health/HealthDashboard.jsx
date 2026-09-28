import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart-panel";
import { Users, Activity, Syringe, AlertOctagon } from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { healthService } from '@/services/healthService';
import { useHSE } from '@/context/HSEContext';
import { AXIS_PROPS, CHART_SERIES, GRID_STYLE, LEGEND_PROPS, TOOLTIP_STYLE } from '@/utils/chartTheme';

// Design family (batch 2B): the Suite chart standard's series colours on a
// white ChartPanel, in both themes.
const STATUS_COLORS = CHART_SERIES;

export default function HealthDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({ statusDistribution: [], exposureTrend: [] });

  useEffect(() => {
    if(currentOrganization) {
      healthService.getHealthStats(currentOrganization.id).then(setStats);
      healthService.getHealthCharts(currentOrganization.id).then(setCharts);
    }
  }, [currentOrganization]);

  const hasExposureData = charts.exposureTrend.some(p => p.exposures > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Employees Monitored" value={stats.totalMonitored || 0} icon={Users} />
        <KPICard title="Records This Month" value={stats.recordsThisMonth || 0} icon={Activity} />
        <KPICard title="Exposure Incidents" value={stats.exposureIncidents || 0} icon={AlertOctagon} />
        <KPICard title="Vaccination Rate" value={stats.vaccinationRate == null ? 'n/a' : `${stats.vaccinationRate}%`} icon={Syringe} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPanel title="Health Status Distribution" bodyClassName="h-64">
          {charts.statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {charts.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend {...LEGEND_PROPS} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-pl-muted text-sm">No health records yet.</div>
          )}
        </ChartPanel>
        <ChartPanel title="Exposure Levels Trend" bodyClassName="h-64">
          {hasExposureData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.exposureTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="month" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="exposures" name="Exposure records" stroke={CHART_SERIES[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-pl-muted text-sm">No exposure records in the last 6 months.</div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-pl-muted font-medium">{title}</p>
          <p className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-pl-sunken">
          <Icon className="h-6 w-6 text-pl-muted" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
