import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AbsenceIntelligence() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Absence Trends</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-[#7a7a9a]">
          Monthly absence chart visualization placeholder
        </CardContent>
      </Card>
      
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Predictive Alerts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="text-yellow-400 font-bold text-sm">Spike Detected</h4>
              <p className="text-[#e0e0e0] text-xs mt-1">Absence rate is 15% higher than average for this season. Consider wellness check-ins.</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-bold text-sm">Pattern Insight</h4>
              <p className="text-[#e0e0e0] text-xs mt-1">Mondays show the highest absence frequency. Potential fatigue or morale indicator.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}