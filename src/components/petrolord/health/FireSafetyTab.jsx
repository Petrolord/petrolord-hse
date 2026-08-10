import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus, FileText, CheckCircle } from 'lucide-react';
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
  const [compliance, setCompliance] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    try {
      const [dashboardStats, eqData, incData, riskData, compData] = await Promise.all([
        fireSafetyService.getDashboardStats(currentOrganization.id),
        fireSafetyService.getEquipment(currentOrganization.id),
        fireSafetyService.getIncidents(currentOrganization.id),
        fireSafetyService.getRisks(currentOrganization.id),
        fireSafetyService.getCompliance(currentOrganization.id),
      ]);
      setStats(dashboardStats);
      setEquipment(eqData);
      setIncidents(incData);
      setRisks(riskData);
      setCompliance(compData);
    } catch (error) {
      console.error("Failed to load fire safety data", error);
    }
  };

  const riskColor = (score) => (score >= 15 ? 'text-red-400' : score >= 8 ? 'text-orange-400' : 'text-green-400');

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

      {/* RISK ASSESSMENT VIEW */}
      {activeSection === 'risk' && (
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Fire Risk Assessment Register</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map(r => (
                <div key={r.id} className="p-4 bg-[#252541] rounded border border-[#3a3a5a]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold">{r.hazard_id}</h4>
                      <p className="text-sm text-gray-400 mt-1">{r.description}</p>
                      {r.location && <p className="text-xs text-gray-500 mt-1">Location: {r.location}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className={`text-2xl font-bold ${riskColor(r.risk_score)}`}>{r.risk_score}</span>
                      <p className="text-xs text-gray-500">L{r.likelihood} × C{r.consequence}</p>
                    </div>
                  </div>
                  {r.mitigation_measures && (
                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-[#3a3a5a]">
                      <span className="text-gray-500">Mitigation:</span> {r.mitigation_measures}
                    </p>
                  )}
                </div>
              ))}
              {risks.length === 0 && <div className="text-center py-12 text-gray-500">No fire risks assessed.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* COMPLIANCE VIEW */}
      {activeSection === 'compliance' && (
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Fire Safety Compliance Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compliance.map(c => (
                <div key={c.id} className="p-4 bg-[#252541] rounded border border-[#3a3a5a] flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-white font-medium">{c.checklist_item}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.standard_ref ? `${c.standard_ref} • ` : ''}
                      {c.last_checked_date ? `Last checked: ${new Date(c.last_checked_date).toLocaleDateString()}` : 'Not yet checked'}
                    </p>
                    {c.remarks && <p className="text-xs text-gray-400 mt-1">{c.remarks}</p>}
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap flex items-center gap-1 ${c.is_compliant ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {c.is_compliant ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {c.is_compliant ? 'Compliant' : 'Non-Compliant'}
                  </div>
                </div>
              ))}
              {compliance.length === 0 && <div className="text-center py-12 text-gray-500">No compliance items recorded.</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}