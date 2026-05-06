import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';

export default function Reporting() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#1e1e30] border border-[#2a2a40] rounded-lg text-center">
        <h3 className="text-xl text-white font-bold mb-4">Compliance Reporting</h3>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]">
            <FileDown className="mr-2 h-4 w-4" /> NUPRC Monthly Pack
          </Button>
          <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]">
            <FileDown className="mr-2 h-4 w-4" /> Annual Environmental Report
          </Button>
        </div>
      </div>
    </div>
  );
}