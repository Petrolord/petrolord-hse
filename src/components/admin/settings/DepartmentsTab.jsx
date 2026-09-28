import React from 'react';
import { Card } from "@/components/ui/card";
import { Info } from 'lucide-react';

export default function DepartmentsTab() {
  return (
    <Card className="p-6 sm:p-8 text-center">
      <div className="flex flex-col items-center justify-center">
        <Info className="h-12 w-12 text-pl-muted mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-pl-text mb-2">Departments Consolidated</h3>
        <p className="text-pl-muted max-w-md mx-auto">
          We have streamlined organization structure. Please use the <strong>Team Management</strong> module to organize your users and groups moving forward.
        </p>
      </div>
    </Card>
  );
}