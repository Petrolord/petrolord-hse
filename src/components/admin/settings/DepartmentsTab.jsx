import React from 'react';
import { Card } from "@/components/ui/card";
import { Info } from 'lucide-react';

export default function DepartmentsTab() {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center">
      <div className="flex flex-col items-center justify-center">
        <Info className="h-12 w-12 text-[#FFC107] mb-4 opacity-80" />
        <h3 className="text-xl font-bold text-white mb-2">Departments Consolidated</h3>
        <p className="text-[#b0b0c0] max-w-md mx-auto">
          We have streamlined organization structure. Please use the <strong>Team Management</strong> module to organize your users and groups moving forward.
        </p>
      </div>
    </Card>
  );
}