import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, LayoutGrid, GitBranch, HelpCircle, LifeBuoy, ChevronRight, Home } from 'lucide-react';
import SearchBar from './SearchBar';
import GettingStarted from './GettingStarted';
import ModuleGuides from './ModuleGuides';
import FeaturesWorkflows from './FeaturesWorkflows';
import FAQs from './FAQs';
import SupportContact from './SupportContact';

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState('start');

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#1f1f35] to-[#1a1a2e] border-b border-[#2a2a40] py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC107] opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Petrolord HSE <span className="text-[#FFC107]">Help Center</span>
          </h1>
          <p className="text-xl text-[#b0b0c0] mb-10 max-w-2xl mx-auto">
            Find guides, documentation, and support for all your HSE management needs.
          </p>
          <SearchBar onSearch={(q) => console.log('Searching:', q)} />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-[#252541] border border-[#3a3a5a] p-1.5 h-auto rounded-xl flex-wrap justify-start sm:justify-center">
            <HelpTabTrigger value="start" icon={Rocket} label="Getting Started" />
            <HelpTabTrigger value="modules" icon={LayoutGrid} label="Module Guides" />
            <HelpTabTrigger value="workflows" icon={GitBranch} label="Features & Workflows" />
            <HelpTabTrigger value="faqs" icon={HelpCircle} label="FAQs" />
            <HelpTabTrigger value="support" icon={LifeBuoy} label="Support" />
          </TabsList>

          <div className="min-h-[500px]">
            <TabsContent value="start" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GettingStarted />
            </TabsContent>
            
            <TabsContent value="modules" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ModuleGuides />
            </TabsContent>
            
            <TabsContent value="workflows" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FeaturesWorkflows />
            </TabsContent>
            
            <TabsContent value="faqs" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FAQs />
            </TabsContent>
            
            <TabsContent value="support" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SupportContact />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function HelpTabTrigger({ value, icon: Icon, label }) {
  return (
    <TabsTrigger 
      value={value}
      className="
        flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all
        data-[state=active]:bg-[#FFC107] data-[state=active]:text-black
        data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#2d2d4a]
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}