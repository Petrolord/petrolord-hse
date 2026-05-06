import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

const mockData = [
  { name: 'Chem', score: 92 },
  { name: 'Ware', score: 85 },
  { name: 'Load', score: 70 },
  { name: 'Log', score: 62 },
  { name: 'Maint', score: 55 },
  { name: 'Prod 1', score: 45 },
  { name: 'Prod 2', score: 30 },
  { name: 'Lab', score: 25 },
];

const getBarColor = (score) => {
  if (score >= 80) return '#dc2626'; // red
  if (score >= 60) return '#ea580c'; // orange
  if (score >= 40) return '#ca8a04'; // yellow
  return '#16a34a'; // green
};

export default function DepartmentRiskChart() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" /> 
          Department Risk Comparison
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Risk scores by department (Sorted)</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" horizontal={false} />
            <XAxis type="number" stroke="#7a7a9a" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" stroke="#7a7a9a" width={50} fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}