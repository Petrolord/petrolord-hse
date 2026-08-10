import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Droplets, Flame, Trash2, FileCheck, Calendar, Activity, Zap } from 'lucide-react';
import ComplianceScoreGauge from '../common/ComplianceScoreGauge';
import StatCard from '../common/StatCard';
import { environmentService } from '@/services/environmentService';
import { useHSE } from '@/context/HSEContext';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from "@/components/ui/use-toast";

export default function EnvironmentDashboard({ onLogSpill, onSubmitMonitoring }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    complianceScore: null, expiringPermits: 0, overdueActions: 0,
    totalFlaring: 0, totalWaste: 0, spillCount: 0
  });

  useEffect(() => {
    if (currentOrganization) {
      environmentService.getDashboardStats(currentOrganization.id).then(s => setStats({
        complianceScore: s.complianceScore ?? null,
        expiringPermits: s.permitsDueSoon ?? 0,
        overdueActions: s.empOverdue ?? 0,
        totalFlaring: s.totalFlaring ?? 0,
        totalWaste: s.totalWaste ?? 0,
        spillCount: s.totalSpills ?? 0,
      }));
    }
  }, [currentOrganization]);

  // Compliance pack: export the permit register with a derived compliance flag.
  const handleGeneratePack = async () => {
    if (!currentOrganization) return;
    try {
      const permits = await environmentService.getPermits(currentOrganization.id);
      if (!permits.length) {
        toast({ title: "Nothing to export", description: "No permits on record to include in the pack.", variant: "destructive" });
        return;
      }
      const soon = Date.now() + 90 * 24 * 60 * 60 * 1000;
      const rows = permits.map(p => {
        const exp = p.expiry_date ? new Date(p.expiry_date) : null;
        let compliance = 'Valid';
        if (exp && exp.getTime() < Date.now()) compliance = 'Expired';
        else if (exp && exp.getTime() <= soon) compliance = 'Expiring Soon';
        return {
          'Permit #': p.permit_number,
          Type: p.type,
          Authority: p.issuing_authority || '',
          'Issue Date': p.issue_date ? new Date(p.issue_date).toLocaleDateString() : '',
          'Expiry Date': exp ? exp.toLocaleDateString() : '',
          Status: p.status,
          Compliance: compliance,
        };
      });
      exportToCsv(`environment-compliance-pack-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast({ title: "Compliance pack generated", description: `${rows.length} permits exported.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate compliance pack.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score */}
        <Card className="lg:col-span-4 bg-[#1e1e30] border-[#2a2a40] flex flex-col justify-center items-center p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-blue-500" /> Compliance Health</h3>
          <ComplianceScoreGauge score={stats.complianceScore} />
          <p className="text-xs text-gray-500 mt-4 text-center max-w-[200px]">Calculated based on active permits, overdue EMP actions, and recent incidents.</p>
        </Card>

        {/* KPIs */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Permits Due (90 Days)" value={stats.expiringPermits} icon={FileCheck} color="text-yellow-400" />
          <StatCard title="Overdue Actions" value={stats.overdueActions} icon={Calendar} color="text-red-400" />
          <StatCard title="Spills (YTD)" value={stats.spillCount} icon={Droplets} color="text-orange-400" />
          
          <StatCard title="Flaring Volume" value={stats.totalFlaring.toLocaleString()} unit="m³" icon={Flame} color="text-purple-400" />
          <StatCard title="Waste Generated" value={stats.totalWaste} unit="tons" icon={Trash2} color="text-gray-400" />
          <StatCard title="Carbon Tax Est." value="$12.5k" icon={Zap} color="text-green-400" />
        </div>
      </div>

      {/* Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Compliance Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stats.expiringPermits > 0 && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Permit Renewal Required</AlertTitle>
                <AlertDescription>{stats.expiringPermits} permits are expiring within 90 days. Please initiate renewal.</AlertDescription>
              </Alert>
            )}
            {stats.overdueActions > 0 && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Overdue EMP Actions</AlertTitle>
                <AlertDescription>{stats.overdueActions} critical actions are past due date.</AlertDescription>
              </Alert>
            )}
            {stats.expiringPermits === 0 && stats.overdueActions === 0 && (
              <div className="text-center py-8 text-gray-500">No critical alerts. Good job!</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white justify-start" onClick={onLogSpill}><Droplets className="mr-2 h-4 w-4" /> Log New Spill</Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start" onClick={onSubmitMonitoring}><Activity className="mr-2 h-4 w-4" /> Submit Monitoring Data</Button>
            <Button className="w-full bg-[#2a2a40] hover:bg-[#3a3a5a] text-white border border-[#3a3a5a] justify-start" onClick={handleGeneratePack}><FileCheck className="mr-2 h-4 w-4" /> Generate Compliance Pack</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}