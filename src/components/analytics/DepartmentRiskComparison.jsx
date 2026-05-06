import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight } from 'lucide-react';

export default function DepartmentRiskComparison({ predictions }) {
  // Extract department risk predictions and sort by probability
  const depts = predictions
    .filter(p => p.prediction_type === 'incident_risk' && p.affected_department)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5); // Top 5

  if (depts.length === 0) return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a] h-full">
      <CardHeader>
        <CardTitle className="text-white text-base">Department Risk</CardTitle>
      </CardHeader>
      <CardContent className="text-[#7a7a9a] text-sm">No department data available.</CardContent>
    </Card>
  );

  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a] h-full">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#8b5cf6]" /> Highest Risk Departments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {depts.map((dept, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{dept.affected_department}</span>
                <span className={`text-xs font-bold ${
                  dept.probability > 70 ? 'text-red-400' : 
                  dept.probability > 40 ? 'text-orange-400' : 'text-yellow-400'
                }`}>{dept.probability}% Probability</span>
              </div>
              <div className="w-full h-1.5 bg-[#252541] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    dept.probability > 70 ? 'bg-red-500' : 
                    dept.probability > 40 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} 
                  style={{ width: `${dept.probability}%` }} 
                />
              </div>
              <p className="text-xs text-[#7a7a9a] mt-1">
                Risk: {dept.predicted_value.type} ({dept.timeframe.replace('_',' ')})
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#3a3a5a] ml-3 group-hover:text-white transition-colors" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}