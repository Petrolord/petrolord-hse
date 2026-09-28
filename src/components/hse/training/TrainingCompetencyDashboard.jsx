import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, GraduationCap, Award } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useHSE } from '@/context/HSEContext';
import { trainingService } from '@/services/trainingService';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES, GRID_STYLE, AXIS_PROPS, TOOLTIP_STYLE, CHART_TYPOGRAPHY } from '@/utils/chartTheme';

// Charts stay white in both themes (ChartPanel) with the chart theme colours.
const TOOLTIP = {
  contentStyle: TOOLTIP_STYLE,
  itemStyle: { color: CHART_COLORS.tooltipText },
  labelStyle: { color: CHART_COLORS.axisText },
};

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
    <div className="h-full p-4 sm:p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Programs" value={stats.activePrograms} icon={BookOpen} />
        <KPICard title="Upcoming Sessions" value={stats.upcomingTrainings} icon={Calendar} />
        <KPICard title="Completed Trainings" value={stats.completedTrainings} icon={GraduationCap} />
        <KPICard title="Qualified Personnel" value={stats.qualifiedPersonnel} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel title="Training Compliance Trend" className="p-5">
          <div className="h-64">
            {hasCompletions ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.complianceTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="month" {...AXIS_PROPS} />
                  <YAxis allowDecimals={false} {...AXIS_PROPS} />
                  <Tooltip {...TOOLTIP} />
                  <Line type="monotone" dataKey="completed" name="Completed trainings" stroke={CHART_SERIES[1]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-pl-muted text-sm">No completed trainings in the last 6 months.</div>
            )}
          </div>
        </ChartPanel>

        <ChartPanel title="Competency Gaps" className="p-5">
          <div className="h-64">
            {charts.competencyGaps.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={charts.competencyGaps} outerRadius="75%">
                  <PolarGrid stroke={CHART_COLORS.grid} />
                  <PolarAngleAxis dataKey="category" tick={{ fill: CHART_COLORS.axisText, fontSize: CHART_TYPOGRAPHY.axisFontSize }} />
                  <PolarRadiusAxis domain={[0, 100]} stroke={CHART_COLORS.axisLine} tick={{ fill: CHART_COLORS.axisText, fontSize: CHART_TYPOGRAPHY.annotationFontSize }} />
                  <Radar name="Avg. assessment score" dataKey="score" stroke={CHART_SERIES[4]} fill={CHART_SERIES[4]} fillOpacity={0.3} />
                  <Tooltip {...TOOLTIP} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-pl-muted text-sm">No competency assessments recorded yet.</div>
            )}
          </div>
        </ChartPanel>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-pl-muted font-medium">{title}</p>
          <p className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text mt-1">{value || 0}</p>
        </div>
        <div className="shrink-0 p-3 rounded-full bg-pl-sunken border border-pl-border text-pl-muted">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
