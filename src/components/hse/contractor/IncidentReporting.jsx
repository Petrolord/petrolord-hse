import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function IncidentReporting() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Incident & Near Miss Reporting</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white"><AlertTriangle className="mr-2 h-4 w-4" /> Report New</Button>
      </div>
      <div className="flex-1 bg-[#252541] border border-[#3a3a5a] rounded-lg flex items-center justify-center">
        <p className="text-[#7a7a9a]">Incident logs involving contractors will appear here.</p>
      </div>
    </div>
  );
}