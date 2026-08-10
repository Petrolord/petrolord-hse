import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, GraduationCap, Award } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useHSE } from '@/context/HSEContext';
import { trainingService } from '@/services/trainingService';

export default function TrainingCompetencyDashboard({ stats }) {
  const { currentOrganization } = useHSE();
  const [charts, setCharts] = useState({ complianceTrend: [], competencyGaps: [] });

  useEffect(() => {
    if (currentOrganization) {
      trainingService.getCharts(currentOrganization.id).then(setCharts);
    }
  }, [currentOrganization]);

  const hasCompletions = charts.complianceTrend.some(p => p.completed > 0);

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
          <CardContent className="h-64">
            {hasCompletions ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.complianceTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" />
                  <XAxis dataKey="month" stroke="#7a7a9a" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#7a7a9a" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="completed" name="Completed trainings" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#7a7a9a] text-sm">No completed trainings in the last 6 months.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Competency Gaps</CardTitle></CardHeader>
          <CardContent className="h-64">
            {charts.competencyGaps.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={charts.competencyGaps} outerRadius="75%">
                  <PolarGrid stroke="#3a3a5a" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#b0b0c0', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#7a7a9a', fontSize: 10 }} />
                  <Radar name="Avg. assessment score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#7a7a9a] text-sm">No competency assessments recorded yet.</div>
            )}
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
