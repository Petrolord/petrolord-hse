import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye } from 'lucide-react';

export default function BehavioralAnalytics() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> Behavioral Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium">No Anomalies Detected</h3>
            <p className="text-gray-500 text-sm mt-2">
              The AI engine is monitoring access patterns and user behavior. 
              No insider threats or unusual activities have been flagged in the last 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">Privilege Abuse Score</div>
            <div className="text-2xl font-bold text-green-400 mt-1">0/100</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">Data Exfiltration Risk</div>
            <div className="text-2xl font-bold text-green-400 mt-1">Low</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">Insider Threat Level</div>
            <div className="text-2xl font-bold text-green-400 mt-1">Minimal</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}