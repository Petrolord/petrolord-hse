import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import OrganizationHeatmap from '@/components/admin/OrganizationHeatmap';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-[#252541] border-[#3a3a5a]">
                <CardHeader>
                    <CardTitle className="text-white text-sm">User Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex items-end gap-2 px-6 pb-2">
                    {[40, 60, 45, 70, 85, 90, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white">{h}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Card className="bg-[#252541] border-[#3a3a5a]">
                <CardHeader>
                    <CardTitle className="text-white text-sm">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center">
                    <div className="relative h-32 w-32 rounded-full border-8 border-purple-500/20 border-t-purple-500 flex items-center justify-center">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">72%</span>
                            <span className="text-[10px] text-purple-400">Recurring</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#252541] border-[#3a3a5a]">
                <CardHeader>
                    <CardTitle className="text-white text-sm">System Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-[#b0b0c0] mb-1">
                            <span>Database CPU</span>
                            <span>42%</span>
                        </div>
                        <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[42%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-[#b0b0c0] mb-1">
                            <span>Storage</span>
                            <span>68%</span>
                        </div>
                        <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-[68%]"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <Card className="bg-[#252541] border-[#3a3a5a] overflow-hidden">
            <CardHeader>
                <CardTitle className="text-white">Global Activity Heatmap</CardTitle>
                <CardDescription className="text-[#b0b0c0]">Real-time organization activity density and status by region.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                 <OrganizationHeatmap />
            </CardContent>
        </Card>
    </div>
  );
}