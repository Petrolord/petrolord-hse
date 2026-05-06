import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, AlertTriangle, FileText, CheckCircle, TrendingUp, 
  Clock, ShieldAlert, BadgeCheck, ArrowRight 
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ContractorDashboard({ setActiveTab }) {
  const { currentOrganization } = useHSE();
  const [metrics, setMetrics] = useState({
    totalContractors: 0,
    activeContractors: 0,
    totalIncidents: 0,
    openPermits: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      loadDashboardData();
    }
  }, [currentOrganization]);

  const loadDashboardData = async () => {
    try {
      const data = await contractorService.getDashboardMetrics(currentOrganization.id);
      setMetrics(data);
      // Mock recent activity for visual fullness if no backend logs yet
      setRecentActivity([
        { id: 1, type: 'Induction', message: 'Safety Induction completed for Global Tech', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500' },
        { id: 2, type: 'Permit', message: 'Hot Work Permit #WP-2025-001 Approved', time: '4 hours ago', icon: FileText, color: 'text-blue-500' },
        { id: 3, type: 'Incident', message: 'Near miss reported at Site B', time: '1 day ago', icon: AlertTriangle, color: 'text-orange-500' },
        { id: 4, type: 'Contractor', message: 'New Contractor "BuildSafe" onboarded', time: '2 days ago', icon: Users, color: 'text-purple-500' },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Contractors" 
            value={metrics.totalContractors} 
            subtitle={`${metrics.activeContractors} Active`}
            icon={Users} 
            color="text-blue-400" 
            bg="bg-blue-400/10"
          />
          <KPICard 
            title="Compliance Rate" 
            value="94%" 
            subtitle="+2.5% from last month"
            icon={BadgeCheck} 
            color="text-green-400" 
            bg="bg-green-400/10"
          />
          <KPICard 
            title="Active Permits" 
            value={metrics.openPermits} 
            subtitle="Across 3 sites"
            icon={FileText} 
            color="text-purple-400" 
            bg="bg-purple-400/10"
          />
          <KPICard 
            title="Incidents (YTD)" 
            value={metrics.totalIncidents} 
            subtitle="0 Critical"
            icon={ShieldAlert} 
            color="text-red-400" 
            bg="bg-red-400/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area (Placeholder) */}
          <Card className="lg:col-span-2 bg-[#252541] border-[#3a3a5a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#FFC107]" />
                Compliance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-[#1a1a2e] rounded-lg border border-[#3a3a5a] border-dashed">
                <p className="text-[#7a7a9a]">Compliance Rate Chart Visualization</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            <Card className="bg-[#252541] border-[#3a3a5a] shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-[#3a3a5a] hover:bg-[#1a1a2e] hover:text-white" onClick={() => setActiveTab('contractors')}>
                  <Users className="h-6 w-6 text-blue-400" />
                  <span>New Contractor</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-[#3a3a5a] hover:bg-[#1a1a2e] hover:text-white" onClick={() => setActiveTab('inductions')}>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span>Start Induction</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-[#3a3a5a] hover:bg-[#1a1a2e] hover:text-white" onClick={() => setActiveTab('permits')}>
                  <FileText className="h-6 w-6 text-purple-400" />
                  <span>Issue Permit</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-[#3a3a5a] hover:bg-[#1a1a2e] hover:text-white" onClick={() => setActiveTab('incidents')}>
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <span>Report Incident</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#252541] border-[#3a3a5a] shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#FFC107]" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-[#3a3a5a] last:border-0 last:pb-0">
                    <div className={`p-2 rounded-full bg-opacity-10 ${activity.color.replace('text-', 'bg-')}`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{activity.type}</p>
                      <p className="text-xs text-[#b0b0c0] line-clamp-1">{activity.message}</p>
                      <p className="text-[10px] text-[#7a7a9a] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, color, bg }) {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a] shadow-lg hover:border-opacity-50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#7a7a9a] uppercase font-bold tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            {subtitle && <p className="text-xs text-[#b0b0c0] mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}