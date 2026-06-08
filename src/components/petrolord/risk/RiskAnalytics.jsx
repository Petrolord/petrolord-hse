import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import RiskHeatMap from './components/RiskHeatMap';

const TOOLTIP = { contentStyle: { backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }, itemStyle: { color: '#fff' }, labelStyle: { color: '#9ca3af' } };
const RATING_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };

const ratingOf = (score) => {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

function Panel({ title, children }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] p-5">
      <h4 className="text-white font-bold mb-4">{title}</h4>
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

  if (loading) return <div className="p-10 text-center text-gray-500">Crunching risk analytics...</div>;
  if (risks.length === 0) return (
    <div className="p-12 text-center border-2 border-dashed border-[#3a3a5a] rounded-xl text-gray-500">
      <h3 className="text-xl font-bold text-white mb-2">No Data to Analyze</h3>
      <p>Register risks to see distribution, exposure and heat-map analytics.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Risk Exposure Heat Map">
          <div className="h-[300px]"><RiskHeatMap risks={risks} /></div>
        </Panel>

        <Panel title="Severity Distribution">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byRating} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                  {byRating.map((e) => <Cell key={e.name} fill={RATING_COLORS[e.name]} />)}
                </Pie>
                <Tooltip {...TOOLTIP} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Risks by Category">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip {...TOOLTIP} cursor={{ fill: '#ffffff10' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Risks by Status">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip {...TOOLTIP} cursor={{ fill: '#ffffff10' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
