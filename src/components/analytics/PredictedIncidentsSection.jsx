import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CalendarDays } from 'lucide-react';

export default function PredictedIncidentsSection({ predictions }) {
  // Filter predictions by timeframe
  const next7 = predictions.find(p => p.prediction_type === 'incident_count' && p.timeframe === '7_days')?.predicted_value?.count || 0;
  const next30 = predictions.find(p => p.prediction_type === 'incident_count' && p.timeframe === '30_days')?.predicted_value?.count || 0;
  const next90 = predictions.find(p => p.prediction_type === 'incident_count' && p.timeframe === '90_days')?.predicted_value?.count || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[#8b5cf6]" /> Predicted Incidents
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PredictionTimeCard days="7" count={next7} />
        <PredictionTimeCard days="30" count={next30} />
        <PredictionTimeCard days="90" count={next90} />
      </div>
    </div>
  );
}

function PredictionTimeCard({ days, count }) {
  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-[#252541] flex items-center justify-center text-[#8b5cf6]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[#7a7a9a] text-xs font-bold uppercase">Next {days} Days</p>
          <p className="text-2xl font-bold text-white">
            {count} <span className="text-sm font-normal text-[#7a7a9a]">incidents</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}