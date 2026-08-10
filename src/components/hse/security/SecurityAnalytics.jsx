import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useHSE } from '@/context/HSEContext';
import { securityService } from '@/services/securityService';
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
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Incidents by Severity</CardTitle></CardHeader>
          <CardContent>
            {analytics.severityDistribution.length > 0 ? (
              <RiskDistributionChart data={analytics.severityDistribution} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">No security incidents recorded.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Incident Trends (6 Months)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {hasIncidents ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.incidentTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                  <XAxis dataKey="month" stroke="#7a7a9a" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#7a7a9a" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#3a3a5a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">No security incidents recorded.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
