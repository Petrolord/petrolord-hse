import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function ExposureHealthLink({ summaryView }) {
  const exposures = [
    { type: "Noise", date: "2025-01-10", level: "High (95dB)", impact: "Hearing degradation risk", action: "Audiometry Scheduled" },
    { type: "Chemical", date: "2024-12-05", level: "Medium", impact: "Skin irritation risk", action: "Dermatology Review Done" }
  ];

  if (summaryView) {
    return (
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Exposure Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exposures.map((exp, i) => (
              <div key={i} className="flex gap-3 relative">
                {/* Timeline Line */}
                {i !== exposures.length - 1 && <div className="absolute left-[19px] top-8 bottom-[-16px] w-[2px] bg-[#2a2a40]" />}
                
                <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/30 z-10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 bg-[#25253e] p-3 rounded-lg border border-[#2a2a40]">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium">{exp.type} Exposure</h4>
                    <span className="text-xs text-[#8f8fdb]">{exp.date}</span>
                  </div>
                  <p className="text-xs text-red-300 mt-1">Impact: {exp.impact}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                    <ArrowRight className="h-3 w-3" /> {exp.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Cumulative Exposure Analysis</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-[#7a7a9a]">
          Visualization of cumulative exposures over time vs health thresholds.
        </CardContent>
      </Card>
      
      {/* Detailed Timeline could go here for full view */}
    </div>
  );
}