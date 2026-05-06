import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Trash2, Wind, CheckCircle } from 'lucide-react';
import { environmentService } from '@/services/environmentService';
import { useHSE } from '@/context/HSEContext';

export default function EnvironmentalDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState({});

  useEffect(() => {
    if(currentOrganization) {
      environmentService.getEnvStats(currentOrganization.id).then(setStats);
    }
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Records" value={stats.totalRecords || 0} icon={Leaf} color="text-green-400" />
        <KPICard title="Waste Generated" value={stats.wasteGenerated || "0"} icon={Trash2} color="text-orange-400" />
        <KPICard title="Emissions Level" value={stats.emissionsLevel || "N/A"} icon={Wind} color="text-blue-400" />
        <KPICard title="Compliance" value={stats.complianceStatus || "0%"} icon={CheckCircle} color="text-purple-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="bg-[#252541] border-[#3a3a5a] h-80">
            <CardHeader><CardTitle className="text-white">Records by Type</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-full pb-12 text-[#7a7a9a]">Chart Area</CardContent>
         </Card>
         <Card className="bg-[#252541] border-[#3a3a5a] h-80">
            <CardHeader><CardTitle className="text-white">Emissions Trend</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-full pb-12 text-[#7a7a9a]">Chart Area</CardContent>
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