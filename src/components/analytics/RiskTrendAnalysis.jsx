import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

const mockData = [
  { date: '10/01', total: 65, chem: 80, ware: 50 },
  { date: '10/15', total: 62, chem: 82, ware: 48 },
  { date: '11/01', total: 60, chem: 85, ware: 45 },
  { date: '11/15', total: 58, chem: 88, ware: 42 },
  { date: '12/01', total: 55, chem: 90, ware: 40 },
  { date: '12/15', total: 52, chem: 92, ware: 38 },
];

export default function RiskTrendAnalysis() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" /> 
          Risk Trend Analysis
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Multi-category historical comparison</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" vertical={false} />
            <XAxis dataKey="date" stroke="#7a7a9a" />
            <YAxis stroke="#7a7a9a" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} name="Total Org" dot={false} />
            <Line type="monotone" dataKey="chem" stroke="#ef4444" name="Chemical" dot={false} />
            <Line type="monotone" dataKey="ware" stroke="#3b82f6" name="Warehouse" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}