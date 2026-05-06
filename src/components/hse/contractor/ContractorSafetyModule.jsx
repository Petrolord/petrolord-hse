import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Users, FileCheck, ClipboardList, AlertTriangle, 
  GraduationCap, Award, Shield, Briefcase 
} from 'lucide-react';

// Components
import ContractorDashboard from './ContractorDashboard';
import ContractorManagement from './ContractorManagement';
import InductionManagement from './InductionManagement';
import SafetyBriefing from './SafetyBriefing';
import PermitManagement from './PermitManagement';
import IncidentReporting from './IncidentReporting';
import TrainingCompetency from './TrainingCompetency';
import PerformanceCompliance from './PerformanceCompliance';

export default function ContractorSafetyModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentOrganization) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[var(--bg-app)] overflow-hidden">
      {/* Module Header & Navigation */}
      <div className="bg-[#1a1a2e] border-b border-[#3a3a5a] pt-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              Contractor Safety Management
            </h1>
            <p className="text-sm text-[#7a7a9a]">
              Manage contractor compliance, inductions, and performance.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-6 w-full overflow-x-auto justify-start no-scrollbar">
            <TabItem value="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <TabItem value="contractors" icon={Users} label="Contractors" />
            <TabItem value="inductions" icon={FileCheck} label="Inductions" />
            <TabItem value="briefings" icon={ClipboardList} label="Briefings" />
            <TabItem value="permits" icon={Briefcase} label="Permits" />
            <TabItem value="incidents" icon={AlertTriangle} label="Incidents" />
            <TabItem value="training" icon={GraduationCap} label="Training" />
            <TabItem value="compliance" icon={Award} label="Compliance" />
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-0 relative">
        {activeTab === 'dashboard' && <ContractorDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'contractors' && <ContractorManagement />}
        {activeTab === 'inductions' && <InductionManagement />}
        {activeTab === 'briefings' && <SafetyBriefing />}
        {activeTab === 'permits' && <PermitManagement />}
        {activeTab === 'incidents' && <IncidentReporting />}
        {activeTab === 'training' && <TrainingCompetency />}
        {activeTab === 'compliance' && <PerformanceCompliance />}
      </div>
    </div>
  );
}

function TabItem({ value, icon: Icon, label }) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 rounded-none bg-transparent px-2 py-3 text-[#7a7a9a] hover:text-white transition-all flex items-center gap-2 min-w-fit"
    >
      <Icon className="h-4 w-4" /> {label}
    </TabsTrigger>
  );
}