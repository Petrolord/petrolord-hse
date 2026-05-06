import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from 'lucide-react';

export default function RiskMonitoring() {
  return (
    <div className="p-12 text-center border-2 border-dashed border-[#3a3a5a] rounded-xl text-gray-500 m-4">
      <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
      <h3 className="text-xl font-bold text-white mb-2">Monitoring & KRIs</h3>
      <p>This module is currently being provisioned. Please check back shortly.</p>
    </div>
  );
}