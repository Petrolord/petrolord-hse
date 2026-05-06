import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskDistributionChart from './RiskDistributionChart';

export default function SecurityAnalytics() {
  const riskData = [
    { name: 'High', value: 10 },
    { name: 'Medium', value: 25 },
    { name: 'Low', value: 45 },
    { name: 'Minimal', value: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Organization Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <RiskDistributionChart data={riskData} />
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Incident Trends (6 Months)</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-[300px] text-gray-500">
            [Incident Trend Line Chart Placeholder]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}