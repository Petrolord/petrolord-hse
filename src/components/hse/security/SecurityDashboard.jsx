import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, GraduationCap, Phone, ExternalLink, ArrowUpRight } from 'lucide-react';
import SecurityRiskGauge from './SecurityRiskGauge';
import { severityVariant } from './securityStatus';
import { useHSE } from '@/context/HSEContext';
import { securityRiskService } from '@/services/securityRiskService';
import { securityService } from '@/services/securityService';
import { incidentService } from '@/services/incidentService';

export default function SecurityDashboard({ setActiveTab }) {
  const { currentOrganization, currentUser } = useHSE();
  const [riskScore, setRiskScore] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [stats, setStats] = useState({ incidentsYTD: 0, pendingTrainings: 0, expiringCredentials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentOrganization && currentUser) {
        setLoading(true);
        const [score, incidents, secStats] = await Promise.all([
          securityRiskService.calculateRiskScore(currentUser.id, currentOrganization.id),
          incidentService.getSecurityIncidents(currentOrganization.id),
          securityService.getSecurityStats(currentOrganization.id),
        ]);
        setRiskScore(score);
        setRecentIncidents(incidents.slice(0, 5));
        setStats(secStats);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentOrganization, currentUser]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Top Section: Risk & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Gauge */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-pl-muted" aria-hidden="true" />
              My Risk Score
            </CardTitle>
            <CardDescription>Score recorded on your security profile</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
            <SecurityRiskGauge score={riskScore} loading={loading} />
            <p className="text-center text-sm text-pl-muted mt-2 px-4">
              {riskScore === null && !loading
                ? 'No risk score has been recorded for you yet.'
                : 'Lower is better. The score comes from your security profile.'}
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards: only metrics backed by real data are shown */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Incidents (YTD)" value={stats.incidentsYTD.toString()} icon={AlertTriangle} />
          <StatsCard title="Training Status" value={stats.pendingTrainings} unit="Pending" icon={CheckCircle} />
          <StatsCard title="Credential Health" value={stats.expiringCredentials} unit="Expiring" icon={Shield} />
        </div>
      </div>

      {/* Middle Section: Alerts & Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Security Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('incidents')}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 text-pl-muted">
              <CheckCircle className="h-10 w-10 mb-2 opacity-40" aria-hidden="true" />
              <p className="text-sm">No active security alerts.</p>
            </div>
          </CardContent>
        </Card>

        {/* Training */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Training Progress
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('awareness')}>Go to Learning</Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 text-pl-muted">
              <GraduationCap className="h-10 w-10 mb-2 opacity-40" aria-hidden="true" />
              <p className="text-sm">No training assigned yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Incidents & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Recent Incidents</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('incidents')}>
              Incident Log <ArrowUpRight className="ml-2 h-3 w-3" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentIncidents.length > 0 ? (
              <div className="space-y-3">
                {recentIncidents.map(inc => (
                  <div key={inc.id} className="flex flex-wrap justify-between items-center gap-2 p-3 bg-pl-sunken hover:bg-pl-border/60 rounded-lg transition-colors cursor-pointer border border-pl-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={severityVariant(inc.severity)}>{inc.severity || 'n/a'}</Badge>
                      <div className="min-w-0">
                        <p className="text-pl-text font-medium text-sm">{inc.title}</p>
                        <p className="text-xs text-pl-muted">{new Date(inc.created_at).toLocaleDateString()} · <span className="font-pl-mono">{inc.reference_code || 'n/a'}</span></p>
                      </div>
                    </div>
                    <Badge variant={inc.status === 'Open' ? 'danger' : 'success'}>
                      {inc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-pl-muted">
                <Shield className="h-10 w-10 mb-2 opacity-40" aria-hidden="true" />
                <p className="text-sm">No recent incidents recorded.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Resources</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-pl-danger-bg rounded-lg border border-pl-danger/40">
              <div className="flex items-center gap-2 text-pl-danger-text font-semibold mb-1">
                <Phone className="h-4 w-4" aria-hidden="true" /> Emergency
              </div>
              <p className="text-2xl text-pl-text font-pl-mono tabular-nums">911 / 112</p>
            </div>
            <div className="space-y-2 pt-2">
              <ResourceLink label="Security Policy 2025" />
              <ResourceLink label="Report Suspicious Email" />
              <ResourceLink label="Travel Safety Advisory" />
              <ResourceLink label="Visitor Access Request" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, unit, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5 flex justify-between items-start">
        <div>
          <p className="text-[11px] font-semibold text-pl-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-semibold text-pl-text mt-1">
            <span className="font-pl-mono tabular-nums">{value}</span>
            {unit && <span className="text-base font-medium">{` ${unit}`}</span>}
          </h3>
        </div>
        <div className="p-2.5 rounded-lg bg-pl-sunken">
          <Icon className="h-5 w-5 text-pl-muted" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceLink({ label }) {
  return (
    <a href="#" className="flex items-center justify-between p-2 rounded hover:bg-pl-sunken text-sm text-pl-text transition-colors group">
      {label} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-pl-primary-text" aria-hidden="true" />
    </a>
  );
}
