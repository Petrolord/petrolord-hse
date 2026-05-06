import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Lock, CheckCircle, GraduationCap, FileText, Phone, ExternalLink, ArrowUpRight } from 'lucide-react';
import SecurityRiskGauge from './SecurityRiskGauge';
import TrainingProgress from './TrainingProgress';
import { useHSE } from '@/context/HSEContext';
import { securityRiskService } from '@/services/securityRiskService';
import { incidentService } from '@/services/incidentService';

export default function SecurityDashboard({ setActiveTab }) {
  const { currentOrganization, currentUser } = useHSE();
  const [riskScore, setRiskScore] = useState(0);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentOrganization && currentUser) {
        setLoading(true);
        const score = await securityRiskService.calculateRiskScore(currentUser.id, currentOrganization.id);
        const incidents = await incidentService.getSecurityIncidents(currentOrganization.id);
        setRiskScore(score);
        setRecentIncidents(incidents.slice(0, 5));
        setLoading(false);
      }
    };
    fetchData();
  }, [currentOrganization, currentUser]);

  const mockTraining = [
    { module: 'Cyber Awareness 2025', progress: 100 },
    { module: 'Phishing Defense Advanced', progress: 45 },
    { module: 'Physical Security Protocols', progress: 10 }
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Top Section: Risk & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Gauge */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-4 flex flex-col shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              My Risk Score
            </CardTitle>
            <CardDescription className="text-gray-400">AI-calculated security posture</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
            <SecurityRiskGauge score={riskScore} loading={loading} />
            <p className="text-center text-sm text-gray-400 mt-2 px-4">
              Your risk score is calculated based on training completion, incident history, and access patterns.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Awareness Score" value="85/100" icon={GraduationCap} color="text-purple-400" bg="bg-purple-500/10" />
          <StatsCard title="Training Status" value="2 Pending" icon={CheckCircle} color="text-yellow-400" bg="bg-yellow-500/10" />
          <StatsCard title="Access Level" value="Level 3" icon={Lock} color="text-blue-400" bg="bg-blue-500/10" />
          <StatsCard title="Incidents (YTD)" value={recentIncidents.length.toString()} icon={AlertTriangle} color="text-orange-400" bg="bg-orange-500/10" />
          <StatsCard title="Compliance" value="98%" icon={FileText} color="text-green-400" bg="bg-green-500/10" />
          <StatsCard title="Credential Health" value="1 Expiring" icon={Shield} color="text-red-400" bg="bg-red-500/10" />
        </div>
      </div>

      {/* Middle Section: Alerts & Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" /> Security Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('incidents')} className="text-gray-400 hover:text-white">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertItem type="critical" title="Urgent: Patch Required" desc="Update your OS to latest version immediately." />
            <AlertItem type="warning" title="New Device Login" desc="Login from Safari on macOS detected at 10:45 AM." />
            <AlertItem type="info" title="Policy Update" desc="New Remote Work policy effective Feb 1st." />
          </CardContent>
        </Card>

        {/* Training */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-500" /> Training Progress
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('awareness')} className="text-gray-400 hover:text-white">Go to Learning</Button>
          </CardHeader>
          <CardContent>
            <TrainingProgress trainings={mockTraining} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Incidents & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-2 shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Incidents</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('incidents')} className="border-[#3a3a5a] text-gray-300 hover:text-white hover:bg-[#2a2a40]">
              Incident Log <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentIncidents.length > 0 ? (
              <div className="space-y-3">
                {recentIncidents.map(inc => (
                  <div key={inc.id} className="flex justify-between items-center p-3 bg-[#2a2a40]/50 hover:bg-[#2a2a40] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#3a3a5a]">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${inc.severity === 'Critical' ? 'bg-red-500' : inc.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-white font-medium text-sm">{inc.title}</p>
                        <p className="text-xs text-gray-400">{new Date(inc.created_at).toLocaleDateString()} • {inc.reference_code}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs border ${
                      inc.status === 'Open' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {inc.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Shield className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No recent incidents recorded.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] shadow-lg shadow-black/20">
          <CardHeader><CardTitle className="text-white">Quick Resources</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" /> Emergency
              </div>
              <p className="text-2xl text-white font-mono">911 / 112</p>
              <p className="text-xs text-gray-400">Global SOC: +1-800-555-0199</p>
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

function StatsCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] hover:border-[#3a3a5a] transition-colors">
      <CardContent className="p-5 flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ type, title, desc }) {
  const color = type === 'critical' ? 'text-red-400' : type === 'warning' ? 'text-orange-400' : 'text-blue-400';
  const border = type === 'critical' ? 'border-l-red-500' : type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500';
  return (
    <div className={`pl-3 border-l-2 ${border} py-1`}>
      <h4 className={`text-sm font-bold ${color}`}>{title}</h4>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
  );
}

function ResourceLink({ label }) {
  return (
    <a href="#" className="flex items-center justify-between p-2 rounded hover:bg-[#2a2a40] text-sm text-gray-300 transition-colors group">
      {label} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
    </a>
  );
}