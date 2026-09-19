import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { benchmarkingService } from '@/services/benchmarkingService';
import { useHSE } from '@/context/HSEContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function BenchmarkingDashboard() {
  const { currentOrganization } = useHSE();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      setLoading(true);
      benchmarkingService.getBenchmarks(currentOrganization.id)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [currentOrganization]);

  if (loading) return <div className="p-8 text-center text-[#7a7a9a]">Loading benchmarking data...</div>;

  if (data.length === 0) {
    return (
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-10 text-center text-[#7a7a9a]">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-white font-medium">No benchmark data yet</p>
          <p className="text-sm mt-1">Industry comparisons appear here once benchmark figures are recorded for your organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Main Comparison Chart */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white">Metric Comparison vs Industry</CardTitle>
          <CardDescription className="text-[#7a7a9a]">Comparing your KPIs against industry average and top quartile performers</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" horizontal={false} />
              <XAxis type="number" stroke="#7a7a9a" />
              <YAxis dataKey="metric_name" type="category" stroke="#fff" width={150} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
                cursor={{ fill: '#ffffff10' }}
              />
              <Legend />
              <Bar dataKey="org_value" name="Your Organization" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="industry_avg" name="Industry Average" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="top_quartile" name="Top Quartile" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}