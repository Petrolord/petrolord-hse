import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileCheck, BookOpen, Activity, Flame, Trash2, Droplets, Power, FileText } from 'lucide-react';
import EnvironmentDashboard from './environment/EnvironmentDashboard';
import ObligationsPermits from './environment/ObligationsPermits';
import EmissionsFlaring from './environment/EmissionsFlaring';
import Monitoring from './environment/Monitoring';
import SpillsRemediation from './environment/SpillsRemediation';
import WasteChemicals from './environment/WasteChemicals';
import StudiesEMP from './environment/StudiesEMP';
import Decommissioning from './environment/Decommissioning';
import Reporting from './environment/Reporting';
import { moduleTabTriggerClass } from './common/ui';

export default function EnvironmentModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Incrementing signals let a dashboard Quick Action both switch tabs and tell
  // the target tab to auto-open its create modal.
  const [spillSignal, setSpillSignal] = useState(0);
  const [monitorSignal, setMonitorSignal] = useState(0);

  const handleLogSpill = () => { setActiveTab('spills'); setSpillSignal(s => s + 1); };
  const handleSubmitMonitoring = () => { setActiveTab('monitoring'); setMonitorSignal(s => s + 1); };

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-pl-border bg-pl-surface">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block shrink-0 bg-pl-sunken p-2 rounded-lg">
            <Activity className="h-6 w-6 text-pl-muted" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Environment Manager</h1>
            <p className="text-pl-muted text-sm mt-1">
              NUPRC & Global Lender Compliant Environmental Management System
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 sm:px-6 bg-pl-surface border-b border-pl-border overflow-x-auto">
            <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0 flex-nowrap w-max">
              <EnvTabTrigger value="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <EnvTabTrigger value="obligations" label="Obligations & Permits" icon={FileCheck} />
              <EnvTabTrigger value="studies" label="Studies & EMP" icon={BookOpen} />
              <EnvTabTrigger value="monitoring" label="Monitoring" icon={Activity} />
              <EnvTabTrigger value="emissions" label="Emissions & Flaring" icon={Flame} />
              <EnvTabTrigger value="waste" label="Waste & Chemicals" icon={Trash2} />
              <EnvTabTrigger value="spills" label="Spills" icon={Droplets} />
              <EnvTabTrigger value="decom" label="Decommissioning" icon={Power} />
              <EnvTabTrigger value="reporting" label="Reporting" icon={FileText} />
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-pl-bg">
            <TabsContent value="dashboard" className="m-0 h-full"><EnvironmentDashboard onLogSpill={handleLogSpill} onSubmitMonitoring={handleSubmitMonitoring} /></TabsContent>
            <TabsContent value="obligations" className="m-0 h-full"><ObligationsPermits /></TabsContent>
            <TabsContent value="emissions" className="m-0 h-full"><EmissionsFlaring /></TabsContent>
            <TabsContent value="monitoring" className="m-0 h-full"><Monitoring openSignal={monitorSignal} /></TabsContent>
            <TabsContent value="waste" className="m-0 h-full"><WasteChemicals /></TabsContent>
            <TabsContent value="spills" className="m-0 h-full"><SpillsRemediation openSignal={spillSignal} /></TabsContent>
            <TabsContent value="studies" className="m-0 h-full"><StudiesEMP /></TabsContent>
            <TabsContent value="decom" className="m-0 h-full"><Decommissioning /></TabsContent>
            <TabsContent value="reporting" className="m-0 h-full"><Reporting /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function EnvTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger value={value} className={moduleTabTriggerClass}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </TabsTrigger>
  );
}
