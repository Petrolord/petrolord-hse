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

// The activity type is named beside its icon, so the icons stay neutral.
const ACTIVITY_STYLE = {
  Contractor: { icon: Users },
  Permit: { icon: FileText },
  Incident: { icon: AlertTriangle },
};

export default function ContractorDashboard({ setActiveTab }) {
  const { currentOrganization } = useHSE();
  const [metrics, setMetrics] = useState({
    totalContractors: 0,
    activeContractors: 0,
    totalIncidents: 0,
    criticalIncidents: 0,
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
      setRecentActivity((data.recentActivity || []).map(a => ({ ...a, ...ACTIVITY_STYLE[a.type] })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Contractors" 
            value={metrics.totalContractors} 
            subtitle={`${metrics.activeContractors} Active`}
            icon={Users} 
          />
          <KPICard 
            title="Compliance Rate" 
            value="No data yet" 
            subtitle="No compliance records yet"
            icon={BadgeCheck} 
          />
          <KPICard 
            title="Active Permits" 
            value={metrics.openPermits} 
            icon={FileText} 
          />
          <KPICard 
            title="Incidents (YTD)" 
            value={metrics.totalIncidents} 
            subtitle={`${metrics.criticalIncidents || 0} Critical`}
            icon={ShieldAlert} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area (Placeholder) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pl-muted" aria-hidden="true" />
                Compliance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-pl-sunken rounded-lg border border-pl-border-strong border-dashed">
                <p className="text-pl-muted">No data yet</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <QuickAction icon={Users} label="New Contractor" onClick={() => setActiveTab('contractors')} />
                <QuickAction icon={CheckCircle} label="Start Induction" onClick={() => setActiveTab('inductions')} />
                <QuickAction icon={FileText} label="Issue Permit" onClick={() => setActiveTab('permits')} />
                <QuickAction icon={AlertTriangle} label="Report Incident" onClick={() => setActiveTab('incidents')} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length === 0 && (
                  <p className="text-sm text-pl-muted">No recent activity yet.</p>
                )}
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-pl-border last:border-0 last:pb-0">
                    <div className="p-2 rounded-full bg-pl-sunken border border-pl-border text-pl-muted">
                      {activity.icon && <activity.icon className="h-4 w-4" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-pl-text font-medium">{activity.type}</p>
                      <p className="text-xs text-pl-muted line-clamp-1">{activity.message}</p>
                      <p className="text-[10px] text-pl-muted mt-1 font-pl-mono tabular-nums">{new Date(activity.at).toLocaleString()}</p>
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

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 whitespace-normal text-center" onClick={onClick}>
      <Icon className="h-6 w-6 text-pl-muted" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}

// A count reads in the mono face; a word ("No data yet") in the body face.
function KPICard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-pl-muted uppercase font-semibold tracking-wider">{title}</p>
            {typeof value === 'number'
              ? <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{value}</h3>
              : <h3 className="text-base font-medium text-pl-muted mt-2">{value}</h3>}
            {subtitle && <p className="text-xs text-pl-muted mt-1">{subtitle}</p>}
          </div>
          <div className="shrink-0 p-3 rounded-xl bg-pl-sunken border border-pl-border text-pl-muted">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
