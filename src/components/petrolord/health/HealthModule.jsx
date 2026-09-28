import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Heart, 
  ShieldAlert, 
  ClipboardList, 
  GraduationCap, 
  FileText, 
  Users, 
  Activity, 
  CheckSquare, 
  Flame, 
  BarChart2 
} from 'lucide-react';

// Sub-components
import HealthDashboard from '@/components/hse/health/HealthDashboard';
import FireSafetyTab from './FireSafetyTab';

// Design family (batch 2B): Health renders inside the signed-in scope
// (src/design/SignedInScope.jsx), so it uses the theme roles directly.
export default function HealthModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-pl-border bg-pl-surface">
        <div className="hidden sm:block bg-pl-sunken p-2 rounded-lg">
          <Heart className="h-6 w-6 text-pl-muted" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="font-pl-display text-2xl font-semibold text-pl-text">
            Health & Safety Manager
          </h1>
          <p className="text-pl-muted text-sm mt-1">
            Integrated Occupational Health, Fire Safety, and Medical Management
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-2 sm:px-6 bg-pl-surface border-b border-pl-border overflow-x-auto">
            <TabsList className="h-auto w-max flex-nowrap justify-start gap-1 rounded-none border-0 bg-transparent p-0">
              <HealthTabTrigger value="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <HealthTabTrigger value="incidents" label="Health Incidents" icon={AlertTriangle} />
              <HealthTabTrigger value="occ_health" label="Occupational Health" icon={Activity} />
              <HealthTabTrigger value="hazards" label="Hazards & Risk" icon={ShieldAlert} />
              <HealthTabTrigger value="inspections" label="Inspections" icon={ClipboardList} />
              <HealthTabTrigger value="training" label="Training" icon={GraduationCap} />
              <HealthTabTrigger value="permits" label="Permits" icon={FileText} />
              <HealthTabTrigger value="contractors" label="Contractors" icon={Users} />
              <HealthTabTrigger value="actions" label="Corrective Actions" icon={CheckSquare} />
              {/* NEW TAB ADDED HERE */}
              <HealthTabTrigger value="fire" label="Fire Safety" icon={Flame} />
              <HealthTabTrigger value="analytics" label="Analytics" icon={BarChart2} />
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-pl-bg">
            {/* Dashboard Content */}
            <TabsContent value="dashboard" className="m-0 h-full">
              <HealthDashboard />
            </TabsContent>

            {/* Fire Safety Content */}
            <TabsContent value="fire" className="m-0 h-full">
              <FireSafetyTab />
            </TabsContent>

            {/* These domains are delivered by their own dedicated apps in the
                main navigation; they are not yet embedded into this combined
                Health & Safety Manager view. Honest WIP state (no false
                "Integrated" claim). */}
            <TabsContent value="incidents" className="m-0 h-full"><WipTab label="Health Incidents" navName="Incidents" icon={AlertTriangle} /></TabsContent>
            <TabsContent value="occ_health" className="m-0 h-full"><WipTab label="Occupational Health" navName="Health" icon={Activity} /></TabsContent>
            <TabsContent value="hazards" className="m-0 h-full"><WipTab label="Hazards & Risk" navName="Risk Management" icon={ShieldAlert} /></TabsContent>
            <TabsContent value="inspections" className="m-0 h-full"><WipTab label="Inspections" navName="Inspections" icon={ClipboardList} /></TabsContent>
            <TabsContent value="training" className="m-0 h-full"><WipTab label="Training" navName="Training & Competency" icon={GraduationCap} /></TabsContent>
            <TabsContent value="permits" className="m-0 h-full"><WipTab label="Permits" navName="Work Permits" icon={FileText} /></TabsContent>
            <TabsContent value="contractors" className="m-0 h-full"><WipTab label="Contractors" navName="Contractors" icon={Users} /></TabsContent>
            <TabsContent value="actions" className="m-0 h-full"><WipTab label="Corrective Actions" navName="Actions" icon={CheckSquare} /></TabsContent>
            <TabsContent value="analytics" className="m-0 h-full"><WipTab label="Analytics" navName="Analytics" icon={BarChart2} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function WipTab({ label, navName, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 text-pl-muted">
      <Icon className="h-12 w-12 mb-4 opacity-40" aria-hidden="true" />
      <h3 className="text-lg font-medium text-pl-text">{label}</h3>
      <p className="mt-1 max-w-md text-sm">
        Not yet integrated into the Health &amp; Safety Manager. Open
        <span className="text-pl-text font-medium"> {navName} </span>
        from the main navigation to manage this area.
      </p>
    </div>
  );
}

function HealthTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger 
      value={value}
      className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-sm font-medium text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </TabsTrigger>
  );
}