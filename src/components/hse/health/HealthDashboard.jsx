import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Syringe, AlertOctagon } from 'lucide-react';
import { healthService } from '@/services/healthService';
import { useHSE } from '@/context/HSEContext';

export default function HealthDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState({});

  useEffect(() => {
    if(currentOrganization) {
      healthService.getHealthStats(currentOrganization.id).then(setStats);
    }
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Employees Monitored" value={stats.totalMonitored || 0} icon={Users} color="text-blue-400" />
        <KPICard title="Records This Month" value={stats.recordsThisMonth || 0} icon={Activity} color="text-green-400" />
        <KPICard title="Exposure Incidents" value={stats.exposureIncidents || 0} icon={AlertOctagon} color="text-red-400" />
        <KPICard title="Vaccination Rate" value={`${stats.vaccinationRate || 0}%`} icon={Syringe} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Health Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-[#7a7a9a]">Pie Chart Visualization Placeholder</div>
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Exposure Levels Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-[#7a7a9a]">Line Chart Visualization Placeholder</div>
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
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}