import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from 'lucide-react';

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /> Environmental Monitoring</CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> New Sample</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-[#252541]">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Limit</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a40]">
                <tr>
                  <td className="px-4 py-3 text-white">pH</td>
                  <td className="px-4 py-3 text-white">7.2</td>
                  <td className="px-4 py-3 text-gray-400">6.0 - 9.0</td>
                  <td className="px-4 py-3 text-gray-400">Outfall 1</td>
                  <td className="px-4 py-3 text-gray-400">2025-01-10</td>
                  <td className="px-4 py-3"><span className="text-green-400">Compliant</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white">Oil & Grease</td>
                  <td className="px-4 py-3 text-white">5.0 mg/l</td>
                  <td className="px-4 py-3 text-gray-400">10.0 mg/l</td>
                  <td className="px-4 py-3 text-gray-400">Outfall 1</td>
                  <td className="px-4 py-3 text-gray-400">2025-01-10</td>
                  <td className="px-4 py-3"><span className="text-green-400">Compliant</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}