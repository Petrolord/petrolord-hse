import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingDown, Calendar } from 'lucide-react';

const mockData = [
  { month: 'Jan', risk: 65, lower: 55, upper: 75 },
  { month: 'Feb', risk: 58, lower: 48, upper: 68 },
  { month: 'Mar', risk: 45, lower: 35, upper: 55 },
  { month: 'Apr', risk: 42, lower: 30, upper: 54 },
  { month: 'May', risk: 38, lower: 25, upper: 51 },
  { month: 'Jun', risk: 35, lower: 20, upper: 50 },
];

export default function SafetyOutlook() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-400" /> 
          90-Day Safety Outlook
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Risk trajectory forecast with confidence intervals</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" vertical={false} />
            <XAxis dataKey="month" stroke="#7a7a9a" />
            <YAxis stroke="#7a7a9a" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            
            {/* Confidence Interval using stacked areas logic or just visual range */}
            {/* Simplified for visual impact: Main Risk Line */}
            <Area 
              type="monotone" 
              dataKey="risk" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorRisk)" 
              name="Predicted Risk Score"
              strokeWidth={3}
            />
            
            {/* Upper/Lower bounds visual representation */}
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="transparent" 
              fill="#3b82f6" 
              fillOpacity={0.1} 
              name="Confidence Interval"
            />
             <Area 
              type="monotone" 
              dataKey="lower" 
              stroke="transparent" 
              fill="transparent" 
            />
            
            <ReferenceLine x="Mar" stroke="white" strokeDasharray="3 3" label={{ position: 'top',  value: 'Q1 Audit', fill: 'white', fontSize: 10 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}