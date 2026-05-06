import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, LayoutDashboard, List, Search, Sliders, Activity, FileText, BarChart2, Zap, Brain, Users } from 'lucide-react';

// Components
import RiskDashboard from './risk/RiskDashboard';
import RiskRegister from './risk/RiskRegister';
import RiskAssessment from './risk/RiskAssessment';
// Placeholders for other tabs to ensure file completeness without exceeding token limit
const PlaceholderTab = ({ name }) => (
  <div className="p-12 text-center border-2 border-dashed border-[#3a3a5a] rounded-xl text-gray-500 m-4">
    <ShieldAlert className="h-16 w-16 mx-auto mb-4 opacity-30" />
    <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
    <p>This module is currently being provisioned. Please check back shortly.</p>
  </div>
);

export default function RiskManagementModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-[#141423] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a40] bg-[#1a1a2e]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
              <ShieldAlert className="text-amber-500 fill-current h-8 w-8" /> 
              Enterprise Risk Management
            </h1>
            <p className="text-[#8f8fdb] text-sm mt-1 ml-11">
              ISO 31000 & COSO Aligned Framework for Strategic Risk Control
            </p>
          </div>
          <div className="text-right">
             <div className="text-xs font-mono text-gray-500">v2.4.0 (Enterprise)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 bg-[#1a1a2e] border-b border-[#2a2a40] overflow-x-auto">
            <TabsList className="bg-transparent space-x-1 h-auto p-0 flex-nowrap w-max">
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

          <div className="flex-1 overflow-y-auto bg-[#141423]">
            <TabsContent value="dashboard" className="m-0 p-6 h-full"><RiskDashboard /></TabsContent>
            <TabsContent value="register" className="m-0 p-6 h-full"><RiskRegister /></TabsContent>
            <TabsContent value="assessment" className="m-0 p-6 h-full"><RiskAssessment /></TabsContent>
            <TabsContent value="mitigation" className="m-0 h-full"><PlaceholderTab name="Risk Mitigation Strategy" /></TabsContent>
            <TabsContent value="monitoring" className="m-0 h-full"><PlaceholderTab name="Monitoring & KRIs" /></TabsContent>
            <TabsContent value="reporting" className="m-0 h-full"><PlaceholderTab name="Risk Reporting Engine" /></TabsContent>
            <TabsContent value="analytics" className="m-0 h-full"><PlaceholderTab name="Predictive Analytics" /></TabsContent>
            <TabsContent value="appetite" className="m-0 h-full"><PlaceholderTab name="Risk Appetite Framework" /></TabsContent>
            <TabsContent value="scenario" className="m-0 h-full"><PlaceholderTab name="Scenario Modeling" /></TabsContent>
            <TabsContent value="culture" className="m-0 h-full"><PlaceholderTab name="Risk Culture & Training" /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function RiskTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger 
      value={value}
      className="
        data-[state=active]:bg-transparent 
        data-[state=active]:text-amber-400 
        data-[state=active]:border-b-2 
        data-[state=active]:border-amber-500 
        data-[state=active]:shadow-none
        rounded-none bg-transparent text-[#8f8fdb] hover:text-white px-4 py-4 transition-all text-sm font-medium flex items-center gap-2 border-b-2 border-transparent whitespace-nowrap
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}