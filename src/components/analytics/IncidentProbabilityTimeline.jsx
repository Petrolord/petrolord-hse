import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from 'lucide-react';

const mockData = [
  { day: 10, probability: 85, type: 'Slip', severity: 3, name: 'Warehouse Spill' },
  { day: 25, probability: 60, type: 'Equipment', severity: 4, name: 'Forklift Failure' },
  { day: 45, probability: 90, type: 'Chemical', severity: 5, name: 'Tank Leak' },
  { day: 60, probability: 40, type: 'PPE', severity: 2, name: 'Missed Check' },
  { day: 80, probability: 75, type: 'Fatigue', severity: 3, name: 'Overtime Incident' },
];

export default function IncidentProbabilityTimeline() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" /> 
          Incident Probability Timeline
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Predicted incidents (Next 90 Days)</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" horizontal={false} />
            <XAxis type="number" dataKey="day" name="Days from now" unit="d" stroke="#7a7a9a" />
            <YAxis type="number" dataKey="probability" name="Probability" unit="%" stroke="#7a7a9a" domain={[0, 100]} />
            <ZAxis type="number" dataKey="severity" range={[100, 500]} name="Severity" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0F1B2E] border border-[#3a3a5a] p-2 text-white rounded text-xs shadow-xl">
                      <p className="font-bold">{data.name}</p>
                      <p>Type: {data.type}</p>
                      <p>Prob: {data.probability}%</p>
                      <p>Day: +{data.day}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Incidents" data={mockData} fill="#ef4444" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}