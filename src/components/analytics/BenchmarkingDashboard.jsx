import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { benchmarkingService } from '@/services/benchmarkingService';
import { useHSE } from '@/context/HSEContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, TrendingUp, Users } from 'lucide-react';

export default function BenchmarkingDashboard() {
  const { currentOrganization } = useHSE();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (currentOrganization?.id) {
      benchmarkingService.getBenchmarks(currentOrganization.id).then(setData);
    }
  }, [currentOrganization]);

  if (data.length === 0) return <div className="p-8 text-center text-[#7a7a9a]">Loading benchmarking data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400"><Trophy className="h-6 w-6" /></div>
            <div>
              <p className="text-[#7a7a9a] text-sm">Industry Percentile</p>
              <h3 className="text-2xl font-bold text-white">Top 15%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-[#7a7a9a] text-sm">YoY Improvement</p>
              <h3 className="text-2xl font-bold text-white">+12.4%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-[#7a7a9a] text-sm">Peer Comparison</p>
              <h3 className="text-2xl font-bold text-white">Above Avg</h3>
            </div>
          </CardContent>
        </Card>
      </div>

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