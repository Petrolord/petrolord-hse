import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export default function SafetyBriefing() {
  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-pl-text">Daily Safety Briefings</h2>
        <Button><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Log Briefing</Button>
      </div>
      <div className="flex-1 min-h-[12rem] bg-pl-surface border border-dashed border-pl-border-strong rounded-lg flex items-center justify-center p-6 text-center">
        <p className="text-pl-muted">Safety briefing logs and attendance records will appear here.</p>
      </div>
    </div>
  );
}