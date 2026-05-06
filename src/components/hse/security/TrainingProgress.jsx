import React from 'react';
import { Progress } from "@/components/ui/progress";

export default function TrainingProgress({ trainings = [] }) {
  return (
    <div className="space-y-5">
      {trainings.map((t, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <span className="text-white font-medium">{t.module}</span>
            <span className={t.progress === 100 ? "text-green-400 font-bold" : "text-gray-400"}>
              {t.progress}%
            </span>
          </div>
          <Progress value={t.progress} className="h-2 bg-[#2a2a40]" indicatorClassName={t.progress === 100 ? "bg-green-500" : "bg-blue-500"} />
        </div>
      ))}
      {trainings.length === 0 && <p className="text-gray-500 text-sm">No active training modules assigned.</p>}
    </div>
  );
}