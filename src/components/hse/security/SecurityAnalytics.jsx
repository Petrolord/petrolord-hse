import React, { useEffect, useState } from 'react';
import { ChartPanel } from "@/components/ui/chart-panel";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, } from 'recharts';
import ChartFrame from '@/components/charts/ChartFrame';
import { useHSE } from '@/context/HSEContext';
import { securityService } from '@/services/securityService';
import { AXIS_PROPS, CHART_SERIES, GRID_STYLE, TOOLTIP_STYLE } from '@/utils/chartTheme';
import RiskDistributionChart from './RiskDistributionChart';

export default function SecurityAnalytics() {
  const { currentOrganization } = useHSE();
  const [analytics, setAnalytics] = useState({ severityDistribution: [], incidentTrend: [] });

  useEffect(() => {
    if (currentOrganization) {
      securityService.getIncidentAnalytics(currentOrganization.id).then(setAnalytics);
    }
  }, [currentOrganization]);

  const hasIncidents = analytics.incidentTrend.some(p => p.incidents > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPanel title="Incidents by Severity">
          {analytics.severityDistribution.length > 0 ? (
            <RiskDistributionChart data={analytics.severityDistribution} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-pl-muted text-sm">No security incidents recorded.</div>
          )}
        </ChartPanel>

        <ChartPanel title="Incident Trends (6 Months)">
          {hasIncidents ? (
            <ChartFrame height={300}>
              <LineChart data={analytics.incidentTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="month" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="incidents" name="Incidents" stroke={CHART_SERIES[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartFrame>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-pl-muted text-sm">No security incidents recorded.</div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
