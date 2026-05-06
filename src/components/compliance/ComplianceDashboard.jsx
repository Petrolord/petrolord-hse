import React, { useState, useEffect } from 'react';
import { complianceService } from '@/services/complianceService';
import { useHSE } from '@/context/HSEContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, FileCheck, AlertOctagon, BookOpen } from 'lucide-react';

export default function ComplianceDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState({});
  const [frameworks, setFrameworks] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    const [st, fw] = await Promise.all([
      complianceService.getStats(currentOrganization.id),
      complianceService.getFrameworks(currentOrganization.id)
    ]);
    setStats(st);
    setFrameworks(fw);
  };

  return (
    <div className="p-6 bg-[var(--bg-app)] min-h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="h-8 w-8 text-cyan-500" /> Compliance Center
          </h2>
          <p className="text-[#b0b0c0]">Manage frameworks, audits, and regulatory requirements</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Add Framework</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Compliant Items" value={stats.compliant} icon={FileCheck} color="text-green-400" />
        <StatCard title="Partial / In Prog" value={stats.partial} icon={BookOpen} color="text-yellow-400" />
        <StatCard title="Non-Compliant" value={stats.nonCompliant} icon={AlertOctagon} color="text-red-400" />
        <StatCard title="Audit Readiness" value="88%" icon={Scale} color="text-cyan-400" />
      </div>

      <h3 className="text-xl font-bold text-white mt-8 mb-4">Active Frameworks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.length > 0 ? frameworks.map(fw => (
          <Card key={fw.id} className="bg-[#252541] border-[#3a3a5a]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white">{fw.name}</h4>
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">v{fw.version || '1.0'}</Badge>
              </div>
              <p className="text-sm text-[#b0b0c0] mb-6">{fw.description || 'No description provided.'}</p>
              <div className="w-full bg-[#1a1a2e] rounded-full h-2.5 mb-1">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="text-right text-xs text-cyan-400">65% Complete</div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-2 p-8 border border-dashed border-[#3a3a5a] rounded-lg text-center text-[#7a7a9a]">
            No frameworks configured. Add ISO 45001 or OSHA standards to get started.
          </div>
        )}
        
        {/* Placeholder for demo if empty */}
        {frameworks.length === 0 && (
           <Card className="bg-[#252541] border-[#3a3a5a] opacity-60">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white">ISO 45001 (Example)</h4>
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">v2018</Badge>
              </div>
              <p className="text-sm text-[#b0b0c0] mb-6">Occupational health and safety management systems.</p>
              <div className="w-full bg-[#1a1a2e] rounded-full h-2.5 mb-1">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <div className="text-right text-xs text-cyan-400">Not Started</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
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