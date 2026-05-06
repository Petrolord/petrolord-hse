import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieIcon } from 'lucide-react';

const data = [
  { name: 'Slip/Fall', value: 35 },
  { name: 'Equipment', value: 25 },
  { name: 'Chemical', value: 20 },
  { name: 'Vehicle', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

export default function IncidentTypeDistribution() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-pink-400" /> 
          Incident Type Distribution
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Predicted incidents by category</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}