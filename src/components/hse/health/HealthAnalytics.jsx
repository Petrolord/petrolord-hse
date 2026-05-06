import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function HealthAnalytics() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <Card className="bg-[#1e1e30] border-[#2a2a40] p-8">
        <CardContent className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Health Analytics Engine</h3>
          <p className="text-[#8f8fdb]">Deep dive analytics into health risks and exposure correlations coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}