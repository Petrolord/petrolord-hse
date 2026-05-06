import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, AlertCircle } from 'lucide-react';

export default function SecurityCompliance() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-500" /> Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#252541] rounded">
            <span className="text-white font-medium">ISO 27001</span>
            <span className="text-green-400 font-bold">Compliant</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#252541] rounded">
            <span className="text-white font-medium">GDPR / Data Privacy</span>
            <span className="text-green-400 font-bold">Compliant</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#252541] rounded border border-yellow-500/20">
            <span className="text-white font-medium">Internal Audit</span>
            <span className="text-yellow-400 font-bold">Due in 15 days</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" /> Policy Acknowledgment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <p className="text-gray-400">Organization-wide Acknowledgment Rate</p>
            <p className="text-xs text-gray-500 mt-4">2 employees pending review of updated IT Policy.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}