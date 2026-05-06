import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ShieldAlert, Activity, CheckCircle } from 'lucide-react';
import RiskHeatMap from './components/RiskHeatMap';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

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

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading risk analytics...</div>;

  const categoryData = Object.keys(stats.byCategory).map(k => ({ name: k, value: stats.byCategory[k] }));
  const statusData = Object.keys(stats.byStatus).map(k => ({ name: k, value: stats.byStatus[k] }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="h-16 w-16 text-blue-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase">Total Risks Identified</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.total}</h3>
          <p className="text-xs text-blue-400 mt-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> Active Registry</p>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase">Critical Risks</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.critical}</h3>
          <p className="text-xs text-red-400 mt-1 flex items-center">Requires immediate action</p>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-16 w-16 text-orange-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase">Avg Risk Score</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.avgScore}</h3>
          <p className="text-xs text-gray-500 mt-1">Out of 25 max</p>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase">Mitigation Active</p>
          <h3 className="text-3xl font-bold text-white mt-2">{statusData.find(d => d.name === 'Mitigated')?.value || 0}</h3>
          <p className="text-xs text-green-400 mt-1">Risks controlled</p>
        </Card>
      </div>

      {/* Main Visuals Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-1">
          <CardHeader><CardTitle className="text-white text-base">Risk Heat Map</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <RiskHeatMap risks={risks} />
          </CardContent>
        </Card>

        {/* Charts */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-2">
          <CardHeader><CardTitle className="text-white text-base">Risk Distribution by Category</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#2a2a40', color: '#fff' }}
                  cursor={{ fill: '#2a2a40' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Risks Table */}
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white text-base">Top Critical Risks (Requiring Action)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#252541] text-gray-400 uppercase text-xs">
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
              <tbody className="divide-y divide-[#2a2a40]">
                {risks.filter(r => r.risk_score >= 12).slice(0, 5).map(risk => (
                  <tr key={risk.id} className="hover:bg-[#252541] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{risk.risk_id}</td>
                    <td className="px-4 py-3 font-medium text-white">{risk.title}</td>
                    <td className="px-4 py-3 text-gray-400">{risk.category}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{risk.likelihood}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{risk.impact}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-bold text-xs">{risk.risk_score}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {risk.owner?.raw_user_meta_data?.full_name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
                {risks.filter(r => r.risk_score >= 12).length === 0 && (
                  <tr><td colSpan="7" className="p-4 text-center text-gray-500">No critical risks found. Excellent!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}