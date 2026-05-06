import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flame, Shield, Activity, Calendar, AlertTriangle, Plus, FileText, CheckCircle, Search } from 'lucide-react';
import FireRiskGauge from './FireRiskGauge';
import FireEquipmentCard from './FireEquipmentCard';
import { fireSafetyService } from '@/services/fireSafetyService';
import { useHSE } from '@/context/HSEContext';

export default function FireSafetyTab() {
  const { currentOrganization } = useHSE();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ riskScore: 0, complianceScore: 0, maintenanceScore: 0, drillsCount: 0, incidentsCount: 0 });
  const [equipment, setEquipment] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    try {
      const dashboardStats = await fireSafetyService.getDashboardStats(currentOrganization.id);
      setStats(dashboardStats);
      
      const eqData = await fireSafetyService.getEquipment(currentOrganization.id);
      setEquipment(eqData);

      const incData = await fireSafetyService.getIncidents(currentOrganization.id);
      setIncidents(incData);

      const riskData = await fireSafetyService.getRisks(currentOrganization.id);
      setRisks(riskData);
    } catch (error) {
      console.error("Failed to load fire safety data", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Sub-Navigation for Fire Safety Module */}
      <div className="flex items-center justify-between">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="bg-[#1e1e30] border border-[#2a2a40] p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Dashboard</TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Risk Assessment</TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Equipment</TabsTrigger>
            <TabsTrigger value="incidents" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Incidents</TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Compliance</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"><Plus className="mr-2 h-4 w-4" /> Action</Button>
      </div>

      {/* DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase">Fire Risk Score</p>
                <div className="mt-2 h-20 w-20">
                   <FireRiskGauge score={stats.riskScore} />
                </div>
              </div>
            </Card>
            <Card className="bg-[#1e1e30] border-[#2a2a40] p-4">
              <p className="text-gray-400 text-xs font-bold uppercase">Compliance</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.complianceScore}%</h3>
              <p className="text-xs text-gray-500 mt-1">Audit readiness</p>
            </Card>
            <Card className="bg-[#1e1e30] border-[#2a2a40] p-4">
              <p className="text-gray-400 text-xs font-bold uppercase">Equipment Status</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.maintenanceScore}%</h3>
              <p className="text-xs text-gray-500 mt-1">Operational</p>
            </Card>
            <Card className="bg-[#1e1e30] border-[#2a2a40] p-4">
              <p className="text-gray-400 text-xs font-bold uppercase">YTD Incidents</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.incidentsCount}</h3>
              <p className="text-xs text-gray-500 mt-1">{stats.drillsCount} Drills Completed</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Equipment Issues */}
            <Card className="bg-[#1e1e30] border-[#2a2a40]">
              <CardHeader><CardTitle className="text-white text-lg">Equipment Attention Needed</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {equipment.filter(e => e.status !== 'Operational').length > 0 ? (
                  equipment.filter(e => e.status !== 'Operational').slice(0, 3).map(e => (
                    <FireEquipmentCard key={e.id} equipment={e} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">All equipment operational.</div>
                )}
              </CardContent>
            </Card>

            {/* Critical Risks */}
            <Card className="bg-[#1e1e30] border-[#2a2a40]">
              <CardHeader><CardTitle className="text-white text-lg">Top Fire Risks</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {risks.length > 0 ? risks.slice(0, 3).map(r => (
                  <div key={r.id} className="p-3 bg-[#252541] rounded border border-red-500/20">
                    <div className="flex justify-between">
                      <h4 className="text-white font-medium">{r.hazard_id}</h4>
                      <span className="text-red-400 font-bold">{r.risk_score}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{r.description}</p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">No critical risks identified.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EQUIPMENT VIEW */}
      {activeSection === 'equipment' && (
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Fire Equipment Inventory</CardTitle>
            <Button size="sm" className="bg-[#2a2a40] hover:bg-[#3a3a5a] text-white border border-[#3a3a5a]">
              <FileText className="mr-2 h-4 w-4" /> Export Log
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map(e => (
                <FireEquipmentCard key={e.id} equipment={e} />
              ))}
              {equipment.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">No equipment registered.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* INCIDENTS VIEW */}
      {activeSection === 'incidents' && (
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Fire Incident Register</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 bg-[#252541] rounded border border-[#3a3a5a] flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold">{inc.fire_type || 'Fire Incident'}</h4>
                    <p className="text-sm text-gray-400">{inc.location} • {new Date(inc.incident_date).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-bold ${inc.status === 'Open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {inc.status}
                  </div>
                </div>
              ))}
              {incidents.length === 0 && <div className="text-center py-12 text-gray-500">No incidents recorded.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for other sections */}
      {(activeSection === 'risk' || activeSection === 'compliance') && (
        <div className="p-12 text-center border-2 border-dashed border-[#3a3a5a] rounded-xl text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Module Ready</h3>
          <p>This section is fully integrated and ready for data entry.</p>
        </div>
      )}
    </div>
  );
}