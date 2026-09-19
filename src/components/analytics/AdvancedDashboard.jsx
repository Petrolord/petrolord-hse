import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid } from 'lucide-react';

// The previous version of this tab rendered eight widgets (risk score strip,
// 90-day outlook, department heat map, probability timeline, type split,
// severity matrix) whose every figure was hardcoded. None of them ran on the
// organization's data, so they were removed. Rebuild each widget from real
// aggregates before bringing this tab back.
export default function AdvancedDashboard() {
  return (
    <div className="min-h-[400px] bg-[#0F1B2E] p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Advanced Safety Analytics</h1>
      </div>
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-10 text-center text-[#7a7a9a]">
          <LayoutGrid className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-white font-medium">Not enough data</p>
          <p className="text-sm mt-1">Advanced analytics will appear here once they are computed from your organization's reports.</p>
        </CardContent>
      </Card>
    </div>
  );
}
