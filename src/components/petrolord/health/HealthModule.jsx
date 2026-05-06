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

export default function HealthModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-[#141423] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a40] bg-[#1a1a2e]">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Heart className="text-red-500 fill-current h-7 w-7" /> 
          Health & Safety Manager
        </h1>
        <p className="text-[#8f8fdb] text-sm mt-1">
          Integrated Occupational Health, Fire Safety, and Medical Management
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 bg-[#1a1a2e] border-b border-[#2a2a40] overflow-x-auto">
            <TabsList className="bg-transparent space-x-1 h-auto p-0 flex-nowrap w-max">
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

          <div className="flex-1 overflow-y-auto p-6 bg-[#141423]">
            {/* Dashboard Content */}
            <TabsContent value="dashboard" className="m-0 h-full">
              <HealthDashboard />
            </TabsContent>

            {/* Fire Safety Content */}
            <TabsContent value="fire" className="m-0 h-full">
              <FireSafetyTab />
            </TabsContent>

            {/* Placeholders for other tabs to reuse existing components or show WIP */}
            <TabsContent value="incidents" className="m-0 h-full text-gray-500 text-center py-20">Health Incidents Module (Integrated)</TabsContent>
            <TabsContent value="occ_health" className="m-0 h-full text-gray-500 text-center py-20">Occupational Health Module (Integrated)</TabsContent>
            <TabsContent value="hazards" className="m-0 h-full text-gray-500 text-center py-20">Risk Assessment Module (Integrated)</TabsContent>
            <TabsContent value="inspections" className="m-0 h-full text-gray-500 text-center py-20">Inspections Module (Integrated)</TabsContent>
            <TabsContent value="training" className="m-0 h-full text-gray-500 text-center py-20">Training Module (Integrated)</TabsContent>
            <TabsContent value="permits" className="m-0 h-full text-gray-500 text-center py-20">Permits Module (Integrated)</TabsContent>
            <TabsContent value="contractors" className="m-0 h-full text-gray-500 text-center py-20">Contractor Module (Integrated)</TabsContent>
            <TabsContent value="actions" className="m-0 h-full text-gray-500 text-center py-20">Actions Module (Integrated)</TabsContent>
            <TabsContent value="analytics" className="m-0 h-full text-gray-500 text-center py-20">Analytics Module (Integrated)</TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function HealthTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger 
      value={value}
      className="
        data-[state=active]:bg-transparent 
        data-[state=active]:text-red-400 
        data-[state=active]:border-b-2 
        data-[state=active]:border-red-500 
        data-[state=active]:shadow-none
        rounded-none bg-transparent text-[#8f8fdb] hover:text-white px-4 py-4 transition-all text-sm font-medium flex items-center gap-2 border-b-2 border-transparent
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}