import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, CheckCircle, Award } from 'lucide-react';

export default function TeamDashboard({ stats }) {
  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Teams" value={stats.totalTeams} icon={Users} color="text-blue-400" />
        <KPICard title="Active Members" value={stats.activeMembers} icon={Briefcase} color="text-purple-400" />
        <KPICard title="Avg Performance" value={`${stats.avgPerformance}%`} icon={Award} color="text-yellow-400" />
        <KPICard title="Active Projects" value={stats.activeProjects} icon={TrendingUp} color="text-green-400" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Department Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-64">
             <div className="text-[#7a7a9a] text-sm">Chart visualization (Pie Chart)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Performance Trends</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-64">
             <div className="text-[#7a7a9a] text-sm">Chart visualization (Line Chart)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a]">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#7a7a9a] font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}