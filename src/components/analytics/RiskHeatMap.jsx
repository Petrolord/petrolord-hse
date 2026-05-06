import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const departments = [
  { name: 'Warehouse A', risk: 85, trend: 'up' },
  { name: 'Logistics', risk: 62, trend: 'stable' },
  { name: 'Chemical Storage', risk: 92, trend: 'up' },
  { name: 'Production Line 1', risk: 45, trend: 'down' },
  { name: 'Production Line 2', risk: 30, trend: 'down' },
  { name: 'Office HQ', risk: 12, trend: 'stable' },
  { name: 'Maintenance', risk: 55, trend: 'up' },
  { name: 'Loading Bay', risk: 70, trend: 'stable' },
  { name: 'Lab', risk: 25, trend: 'down' },
];

const getColor = (risk) => {
  if (risk >= 80) return 'bg-red-600 hover:bg-red-500';
  if (risk >= 60) return 'bg-orange-600 hover:bg-orange-500';
  if (risk >= 40) return 'bg-yellow-600 hover:bg-yellow-500';
  if (risk >= 20) return 'bg-blue-600 hover:bg-blue-500';
  return 'bg-green-600 hover:bg-green-500';
};

export default function RiskHeatMap() {
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-orange-400" /> 
          Risk Heat Map
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Departmental risk intensity</CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-3 gap-2 h-[250px]">
          <TooltipProvider>
            {departments.map((dept, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div 
                    className={`rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${getColor(dept.risk)} p-2`}
                  >
                    <span className="text-white font-bold text-lg">{dept.risk}</span>
                    <span className="text-white/80 text-xs text-center">{dept.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black border border-white/20 text-white">
                  <p className="font-bold">{dept.name}</p>
                  <p>Risk Score: {dept.risk}</p>
                  <p>Trend: {dept.trend === 'up' ? 'Worsening ↗' : dept.trend === 'down' ? 'Improving ↘' : 'Stable →'}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}