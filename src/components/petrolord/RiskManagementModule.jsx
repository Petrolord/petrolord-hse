import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, LayoutDashboard, List, Search, Sliders, Activity, FileText, BarChart2, Zap, Brain, Users } from 'lucide-react';

// Components
import RiskDashboard from './risk/RiskDashboard';
import RiskRegister from './risk/RiskRegister';
import RiskAssessment from './risk/RiskAssessment';
import RiskMitigation from './risk/RiskMitigation';
import RiskMonitoring from './risk/RiskMonitoring';
import RiskReporting from './risk/RiskReporting';
import RiskAnalytics from './risk/RiskAnalytics';
import RiskAppetite from './risk/RiskAppetite';
import ScenarioPlanning from './risk/ScenarioPlanning';
import RiskCulture from './risk/RiskCulture';
import { moduleTabTriggerClass } from './common/ui';

export default function RiskManagementModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-pl-border bg-pl-surface">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:block shrink-0 bg-pl-sunken p-2 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-pl-muted" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Enterprise Risk Management</h1>
              <p className="text-pl-muted text-sm mt-1">
                ISO 31000 & COSO Aligned Framework for Strategic Risk Control
              </p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs font-pl-mono text-pl-muted">v2.4.0 (Enterprise)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 sm:px-6 bg-pl-surface border-b border-pl-border overflow-x-auto">
            <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0 flex-nowrap w-max">
              <RiskTabTrigger value="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <RiskTabTrigger value="register" label="Risk Register" icon={List} />
              <RiskTabTrigger value="assessment" label="Assessment" icon={Search} />
              <RiskTabTrigger value="mitigation" label="Mitigation" icon={Sliders} />
              <RiskTabTrigger value="monitoring" label="Monitoring & Control" icon={Activity} />
              <RiskTabTrigger value="reporting" label="Reporting" icon={FileText} />
              <RiskTabTrigger value="analytics" label="Analytics" icon={BarChart2} />
              <RiskTabTrigger value="appetite" label="Appetite & Tolerance" icon={Zap} />
              <RiskTabTrigger value="scenario" label="Scenario Planning" icon={Brain} />
              <RiskTabTrigger value="culture" label="Culture & Training" icon={Users} />
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-pl-bg">
            <TabsContent value="dashboard" className="m-0 p-4 sm:p-6 h-full"><RiskDashboard /></TabsContent>
            <TabsContent value="register" className="m-0 p-4 sm:p-6 h-full"><RiskRegister /></TabsContent>
            <TabsContent value="assessment" className="m-0 p-4 sm:p-6 h-full"><RiskAssessment /></TabsContent>
            <TabsContent value="mitigation" className="m-0 p-4 sm:p-6 h-full"><RiskMitigation /></TabsContent>
            <TabsContent value="monitoring" className="m-0 p-4 sm:p-6 h-full"><RiskMonitoring /></TabsContent>
            <TabsContent value="reporting" className="m-0 p-4 sm:p-6 h-full"><RiskReporting /></TabsContent>
            <TabsContent value="analytics" className="m-0 p-4 sm:p-6 h-full"><RiskAnalytics /></TabsContent>
            <TabsContent value="appetite" className="m-0 p-4 sm:p-6 h-full"><RiskAppetite /></TabsContent>
            <TabsContent value="scenario" className="m-0 p-4 sm:p-6 h-full"><ScenarioPlanning /></TabsContent>
            <TabsContent value="culture" className="m-0 p-4 sm:p-6 h-full"><RiskCulture /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function RiskTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger value={value} className={moduleTabTriggerClass}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </TabsTrigger>
  );
}
