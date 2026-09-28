import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export default function TrainingCompetency() {
  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-pl-text">Training & Competency Matrix</h2>
        <Button><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Record</Button>
      </div>
      <div className="flex-1 min-h-[12rem] bg-pl-surface border border-dashed border-pl-border-strong rounded-lg flex items-center justify-center p-6 text-center">
        <p className="text-pl-muted">Training records and competency certifications will appear here.</p>
      </div>
    </div>
  );
}