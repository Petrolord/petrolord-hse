import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileCheck, BookOpen, Activity, Flame, Trash2, Droplets, Power, FileText } from 'lucide-react';
import EnvironmentDashboard from './environment/EnvironmentDashboard';
import ObligationsPermits from './environment/ObligationsPermits';
import EmissionsFlaring from './environment/EmissionsFlaring';
import Monitoring from './environment/Monitoring';

export default function EnvironmentModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-[#141423] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a40] bg-[#1a1a2e]">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Activity className="text-green-500 fill-current h-7 w-7" /> 
          Environment Manager
        </h1>
        <p className="text-[#8f8fdb] text-sm mt-1">
          NUPRC & Global Lender Compliant Environmental Management System
        </p>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 bg-[#1a1a2e] border-b border-[#2a2a40] overflow-x-auto">
            <TabsList className="bg-transparent space-x-1 h-auto p-0 flex-nowrap w-max">
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

          <div className="flex-1 overflow-y-auto p-6 bg-[#141423]">
            <TabsContent value="dashboard" className="m-0 h-full"><EnvironmentDashboard /></TabsContent>
            <TabsContent value="obligations" className="m-0 h-full"><ObligationsPermits /></TabsContent>
            <TabsContent value="emissions" className="m-0 h-full"><EmissionsFlaring /></TabsContent>
            <TabsContent value="monitoring" className="m-0 h-full"><Monitoring /></TabsContent>
            {/* Placeholders for other tabs to prevent crash if clicked, can be expanded later */}
            <TabsContent value="studies" className="m-0 h-full text-gray-500 flex items-center justify-center">Studies & EMP Module Loading...</TabsContent>
            <TabsContent value="waste" className="m-0 h-full text-gray-500 flex items-center justify-center">Waste Management Module Loading...</TabsContent>
            <TabsContent value="spills" className="m-0 h-full text-gray-500 flex items-center justify-center">Spill Management Module Loading...</TabsContent>
            <TabsContent value="decom" className="m-0 h-full text-gray-500 flex items-center justify-center">Decommissioning Module Loading...</TabsContent>
            <TabsContent value="reporting" className="m-0 h-full text-gray-500 flex items-center justify-center">Reporting Module Loading...</TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function EnvTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger 
      value={value}
      className="
        data-[state=active]:bg-transparent 
        data-[state=active]:text-green-400 
        data-[state=active]:border-b-2 
        data-[state=active]:border-green-500 
        data-[state=active]:shadow-none
        rounded-none bg-transparent text-[#8f8fdb] hover:text-white px-4 py-4 transition-all text-sm font-medium flex items-center gap-2 border-b-2 border-transparent
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}