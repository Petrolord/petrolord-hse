import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Syringe, AlertOctagon } from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { healthService } from '@/services/healthService';
import { useHSE } from '@/context/HSEContext';

const STATUS_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

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
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Employees Monitored" value={stats.totalMonitored || 0} icon={Users} color="text-blue-400" />
        <KPICard title="Records This Month" value={stats.recordsThisMonth || 0} icon={Activity} color="text-green-400" />
        <KPICard title="Exposure Incidents" value={stats.exposureIncidents || 0} icon={AlertOctagon} color="text-red-400" />
        <KPICard title="Vaccination Rate" value={stats.vaccinationRate == null ? '--' : `${stats.vaccinationRate}%`} icon={Syringe} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Health Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
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
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#b0b0c0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#7a7a9a] text-sm">No health records yet.</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Exposure Levels Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {hasExposureData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.exposureTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" />
                  <XAxis dataKey="month" stroke="#7a7a9a" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#7a7a9a" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="exposures" name="Exposure records" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#7a7a9a] text-sm">No exposure records in the last 6 months.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a]">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#7a7a9a] font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}