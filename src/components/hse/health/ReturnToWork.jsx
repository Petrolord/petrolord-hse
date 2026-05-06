import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ReturnToWork() {
  // Mock Data
  const activePlan = {
    incident: "Back Injury (Lifting)",
    phase: 2,
    totalPhases: 3,
    progress: 66,
    startDate: "2025-01-05",
    targetDate: "2025-02-01",
    restrictions: "No lifting > 5kg. Seated work only."
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40] border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-white">Active RTW Plan: {activePlan.incident}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-white">Overall Progress</span>
                <span className="text-blue-400">{activePlan.progress}%</span>
              </div>
              <Progress value={activePlan.progress} className="h-2 bg-[#2a2a40]" indicatorClassName="bg-blue-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <PhaseCard phase={1} current={activePlan.phase} label="Medical Clearance" desc="Initial assessment & approval" />
              <PhaseCard phase={2} current={activePlan.phase} label="Graduated Duties" desc="Part-time / Light duties" />
              <PhaseCard phase={3} current={activePlan.phase} label="Full Return" desc="Full capacity assessment" />
            </div>

            <div className="bg-[#25253e] p-4 rounded-lg mt-4 border border-[#2a2a40]">
              <h4 className="text-white font-bold text-sm mb-2">Current Restrictions</h4>
              <p className="text-[#e0e0e0] text-sm">{activePlan.restrictions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseCard({ phase, current, label, desc }) {
  const status = phase < current ? 'completed' : phase === current ? 'active' : 'pending';
  const colors = {
    completed: 'bg-green-500/20 border-green-500/30 text-green-400',
    active: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    pending: 'bg-[#2a2a40] border-[#3a3a5a] text-gray-500'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[status]}`}>
      <div className="text-xs uppercase font-bold mb-1">Phase {phase}</div>
      <div className="font-bold mb-1">{label}</div>
      <div className="text-[10px] opacity-80">{desc}</div>
    </div>
  );
}