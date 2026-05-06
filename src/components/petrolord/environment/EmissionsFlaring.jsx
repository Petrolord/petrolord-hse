import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Plus } from 'lucide-react';

export default function EmissionsFlaring() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /> Daily Flare Log</CardTitle>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700"><Plus className="mr-2 h-4 w-4" /> Log Data</Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 border border-dashed border-[#3a3a5a] rounded-lg">
              No flare data logged for today.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Gas Monetisation Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Target Date</span>
                <span className="text-white font-bold">Dec 2026</span>
              </div>
              <div className="w-full bg-[#2a2a40] h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[35%]"></div>
              </div>
              <p className="text-xs text-gray-500">Project currently in FEED phase. NUPRC submission pending.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}