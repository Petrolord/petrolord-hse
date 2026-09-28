import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

  // Design family (batch 2B): the risk band is a status Badge with its word
  // (High, Medium or Low) beside the score; the thresholds are unchanged.
  const riskBand = (score) => (score >= 15 ? { variant: 'danger', word: 'High' } : score >= 8 ? { variant: 'warning', word: 'Medium' } : { variant: 'success', word: 'Low' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Sub-Navigation for Fire Safety Module */}
      <div className="flex items-center justify-between gap-2">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full min-w-0 overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="ml-4 shrink-0"><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Action</Button>
      </div>

      {/* DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-pl-muted text-xs font-semibold uppercase">Fire Risk Score</p>
                <div className="mt-2 h-32 w-32">
                   {stats.riskScore === null ? (
                     <p className="text-sm font-semibold text-pl-muted pt-6">No data yet</p>
                   ) : (
                     <FireRiskGauge score={stats.riskScore} />
                   )}
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-pl-muted text-xs font-semibold uppercase">Compliance</p>
              <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{stats.complianceScore === null ? <span className="font-pl-sans text-xl text-pl-muted">No data yet</span> : `${stats.complianceScore}%`}</h3>
              <p className="text-xs text-pl-muted mt-1">Audit readiness</p>
            </Card>
            <Card className="p-4">
              <p className="text-pl-muted text-xs font-semibold uppercase">Equipment Status</p>
              <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{stats.maintenanceScore === null ? <span className="font-pl-sans text-xl text-pl-muted">No data yet</span> : `${stats.maintenanceScore}%`}</h3>
              <p className="text-xs text-pl-muted mt-1">Operational</p>
            </Card>
            <Card className="p-4">
              <p className="text-pl-muted text-xs font-semibold uppercase">Incidents (All Time)</p>
              <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{stats.incidentsCount}</h3>
              <p className="text-xs text-pl-muted mt-1">{stats.drillsCount} Drills Completed</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Equipment Issues */}
            <Card>
              <CardHeader><CardTitle>Equipment Attention Needed</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {equipment.filter(e => e.status !== 'Operational').length > 0 ? (
                  equipment.filter(e => e.status !== 'Operational').slice(0, 3).map(e => (
                    <FireEquipmentCard key={e.id} equipment={e} />
                  ))
                ) : (
                  <div className="text-center py-8 text-pl-muted">All equipment operational.</div>
                )}
              </CardContent>
            </Card>

            {/* Critical Risks */}
            <Card>
              <CardHeader><CardTitle>Top Fire Risks</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {risks.length > 0 ? risks.slice(0, 3).map(r => (
                  <div key={r.id} className="p-3 bg-pl-sunken rounded border border-pl-border">
                    <div className="flex justify-between gap-2">
                      <h4 className="text-pl-text font-medium">{r.hazard_id}</h4>
                      <span className="flex items-center gap-2">
                        <Badge variant={riskBand(r.risk_score).variant}>{riskBand(r.risk_score).word}</Badge>
                        <span className="font-pl-mono tabular-nums font-semibold text-pl-text">{r.risk_score}</span>
                      </span>
                    </div>
                    <p className="text-sm text-pl-muted mt-1">{r.description}</p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-pl-muted">No critical risks identified.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EQUIPMENT VIEW */}
      {activeSection === 'equipment' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Fire Equipment Inventory</CardTitle>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Export Log
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map(e => (
                <FireEquipmentCard key={e.id} equipment={e} />
              ))}
              {equipment.length === 0 && <div className="col-span-3 text-center py-12 text-pl-muted">No equipment registered.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* INCIDENTS VIEW */}
      {activeSection === 'incidents' && (
        <Card>
          <CardHeader><CardTitle>Fire Incident Register</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 bg-pl-sunken rounded border border-pl-border flex justify-between items-center gap-3">
                  <div>
                    <h4 className="text-pl-text font-semibold">{inc.fire_type || 'Fire Incident'}</h4>
                    <p className="text-sm text-pl-muted">{inc.location} · {new Date(inc.incident_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={inc.status === 'Open' ? 'danger' : 'success'}>
                    {inc.status}
                  </Badge>
                </div>
              ))}
              {incidents.length === 0 && <div className="text-center py-12 text-pl-muted">No incidents recorded.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RISK ASSESSMENT VIEW */}
      {activeSection === 'risk' && (
        <Card>
          <CardHeader><CardTitle>Fire Risk Assessment Register</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map(r => (
                <div key={r.id} className="p-4 bg-pl-sunken rounded border border-pl-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-pl-text font-semibold">{r.hazard_id}</h4>
                      <p className="text-sm text-pl-muted mt-1">{r.description}</p>
                      {r.location && <p className="text-xs text-pl-muted mt-1">Location: {r.location}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant={riskBand(r.risk_score).variant}>{riskBand(r.risk_score).word}</Badge>
                        <span className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{r.risk_score}</span>
                      </div>
                      <p className="text-xs text-pl-muted font-pl-mono">L{r.likelihood} × C{r.consequence}</p>
                    </div>
                  </div>
                  {r.mitigation_measures && (
                    <p className="text-xs text-pl-muted mt-2 pt-2 border-t border-pl-border">
                      <span className="font-medium text-pl-text">Mitigation:</span> {r.mitigation_measures}
                    </p>
                  )}
                </div>
              ))}
              {risks.length === 0 && <div className="text-center py-12 text-pl-muted">No fire risks assessed.</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* COMPLIANCE VIEW */}
      {activeSection === 'compliance' && (
        <Card>
          <CardHeader><CardTitle>Fire Safety Compliance Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compliance.map(c => (
                <div key={c.id} className="p-4 bg-pl-sunken rounded border border-pl-border flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-pl-text font-medium">{c.checklist_item}</h4>
                    <p className="text-xs text-pl-muted mt-1">
                      {c.standard_ref ? `${c.standard_ref} · ` : ''}
                      {c.last_checked_date ? `Last checked: ${new Date(c.last_checked_date).toLocaleDateString()}` : 'Not yet checked'}
                    </p>
                    {c.remarks && <p className="text-xs text-pl-muted mt-1">{c.remarks}</p>}
                  </div>
                  <Badge variant={c.is_compliant ? 'success' : 'danger'} className="whitespace-nowrap flex items-center gap-1">
                    {c.is_compliant ? <CheckCircle className="h-3 w-3" aria-hidden="true" /> : <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                    {c.is_compliant ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                </div>
              ))}
              {compliance.length === 0 && <div className="text-center py-12 text-pl-muted">No compliance items recorded.</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}