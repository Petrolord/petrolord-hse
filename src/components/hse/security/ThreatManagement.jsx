import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, ShieldAlert } from 'lucide-react';

export default function ThreatManagement() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Radar className="h-5 w-5 text-red-500" /> Active Threats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-[#252541] rounded border border-orange-500/30 flex items-start gap-4">
              <ShieldAlert className="h-5 w-5 text-orange-400 mt-1" />
              <div>
                <h4 className="text-white font-bold">CVE-2025-1029 Vulnerability</h4>
                <p className="text-sm text-gray-400">Critical patch pending for server cluster A.</p>
                <div className="mt-2 text-xs text-orange-400 font-mono">Risk: High | Deadline: 24h</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Patch Management</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Systems Patched</span>
              <span className="text-white">92%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[92%]"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">External Intel</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">No direct threats targeting energy sector in current region detected by intel feeds.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}