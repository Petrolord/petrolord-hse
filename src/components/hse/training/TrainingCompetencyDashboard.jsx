import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, GraduationCap, Award } from 'lucide-react';

export default function TrainingCompetencyDashboard({ stats }) {
  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Active Programs" value={stats.activePrograms} icon={BookOpen} color="text-blue-400" />
        <KPICard title="Upcoming Sessions" value={stats.upcomingTrainings} icon={Calendar} color="text-purple-400" />
        <KPICard title="Completed Trainings" value={stats.completedTrainings} icon={GraduationCap} color="text-green-400" />
        <KPICard title="Qualified Personnel" value={stats.qualifiedPersonnel} icon={Award} color="text-yellow-400" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Training Compliance Trend</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-64">
             <div className="text-[#7a7a9a] text-sm">Chart visualization (Line Chart)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Competency Gaps</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-64">
             <div className="text-[#7a7a9a] text-sm">Chart visualization (Radar Chart)</div>
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