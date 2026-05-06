import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export default function PermitManagement() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Work Permits</h2>
        <Button className="bg-blue-600 text-white"><Plus className="mr-2 h-4 w-4" /> Issue Permit</Button>
      </div>
      <div className="flex-1 bg-[#252541] border border-[#3a3a5a] rounded-lg flex items-center justify-center">
        <p className="text-[#7a7a9a]">Active and historical work permits will appear here.</p>
      </div>
    </div>
  );
}