import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IncidentsEmpty({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-[#3a3a5a] rounded-lg bg-[#1f1f35]/50 m-4">
      <div className="bg-[#252541] p-4 rounded-full mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Incidents Reported</h3>
      <p className="text-[#b0b0c0] max-w-sm mb-6">
        Good news! There are no incidents recorded yet. Use this space to report any accidents or near misses when they occur.
      </p>
      <Button 
        onClick={onCreate} 
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        <Plus className="h-4 w-4 mr-2" />
        Report Incident
      </Button>
    </div>
  );
}