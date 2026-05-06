import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function HazardEscalationWarnings({ predictions }) {
  const warnings = predictions.filter(p => p.prediction_type === 'hazard_escalation');

  if (warnings.length === 0) return null;

  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a] border-l-4 border-l-red-500 h-full">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-red-500" /> Hazard Escalation Warnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {warnings.map((warn, idx) => (
          <div key={idx} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-red-400 font-bold text-sm mb-1">Escalation Risk: {warn.probability}%</h4>
                <p className="text-white text-sm font-medium">{warn.predicted_value.source}</p>
                <p className="text-[#b0b0c0] text-xs mt-1">
                  Potential: <span className="text-white">{warn.predicted_value.potential}</span>
                </p>
                <p className="text-[#b0b0c0] text-xs mt-1 italic">
                  "{warn.predicted_value.reason}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}