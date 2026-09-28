import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function IncidentReporting() {
  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-pl-text">Incident & Near Miss Reporting</h2>
        <Button><AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" /> Report New</Button>
      </div>
      <div className="flex-1 min-h-[12rem] bg-pl-surface border border-dashed border-pl-border-strong rounded-lg flex items-center justify-center p-6 text-center">
        <p className="text-pl-muted">Incident logs involving contractors will appear here.</p>
      </div>
    </div>
  );
}