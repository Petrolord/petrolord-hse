import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Users, Activity, CreditCard, RefreshCw, Settings, ShieldCheck } from 'lucide-react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'; 
import AuditLog from '@/components/admin/branding/AuditLog';
import { useHSE } from '@/context/HSEContext';

// IMPORTANT: Import AI Components specifically for this view
import UniversalAIBanner from '@/components/analytics/UniversalAIBanner';
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';
import AlertNotifications from '@/components/analytics/AlertNotifications'; 

export default function SuperAdminDashboard() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('overview');

  // Hardcoded stats for Super Admin view
  const stats = [
    { title: 'Total Organizations', value: '18', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Users', value: '10', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Monthly Revenue', value: '$124.5k', icon: CreditCard, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="p-6 bg-[#0F1B2E] min-h-screen text-white overflow-y-auto pb-20">
      
      {/* Global Alert Notification Listener */}
      <AlertNotifications />

      {/* 🚀 CRITICAL: AI BANNER AT THE VERY TOP */}
      <UniversalAIBanner />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Super Admin Console
          </h1>
          <p className="text-[#7a7a9a] mt-1">Centralized control plane for Petrolord HSE ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white">
            <Settings className="h-4 w-4 mr-2" /> Branding Manager
          </Button>
          <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#1a1a2e] border border-[#3a3a5a] p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Overview</TabsTrigger>
          <TabsTrigger value="ai-insights" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex items-center gap-2">
             AI Insights <span className="bg-white text-purple-900 text-[10px] font-bold px-1.5 rounded-full">NEW</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Organizations</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Users</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-[#1a1a2e] border-[#3a3a5a]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[#7a7a9a] text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 
             Main Dashboard Content:
             The AnalyticsDashboard component appears to include the charts, system load metrics, AND the global heatmap.
             We render ONLY this component to avoid duplicates of the map and system load sections.
             We use full width (grid-cols-1) to ensure the internal map displays correctly.
          */}
          <div className="grid grid-cols-1 gap-6">
            <AnalyticsDashboard />
          </div>

        </TabsContent>

        {/* 🧠 AI INSIGHTS TAB CONTENT */}
        <TabsContent value="ai-insights" className="animate-in fade-in duration-500">
           <div className="bg-[#131320] border-2 border-[#8b5cf6] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)]">
              <div className="bg-[#8b5cf6]/10 p-4 border-b border-[#8b5cf6]/30 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-[#8b5cf6]" />
                    Global Safety Prediction Model
                 </h2>
                 <span className="text-xs text-purple-300 font-mono">MODEL_V3.0_RECOMMENDATION_ENGINE_ACTIVE</span>
              </div>
              <PredictiveInsightsDashboard isEmbedded={true} />
           </div>
        </TabsContent>

        <TabsContent value="organizations">
          <div className="p-12 text-center text-[#7a7a9a] bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
            Organizations Management Module (Placeholder)
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="p-12 text-center text-[#7a7a9a] bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
            User Management Module (Placeholder)
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}