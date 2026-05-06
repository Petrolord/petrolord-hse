import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Shield, Calendar, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Sub-components
import FitnessTracking from './FitnessTracking';
import HealthProfile from './HealthProfile';
import HealthScreening from './HealthScreening';
import ReturnToWork from './ReturnToWork';
import AbsenceIntelligence from './AbsenceIntelligence';
import MentalHealthWellness from './MentalHealthWellness';
import HealthCompliance from './HealthCompliance';
import HealthAnalytics from './HealthAnalytics';
import TeamHealthDashboard from './TeamHealthDashboard';
import ExposureHealthLink from './ExposureHealthLink';
import HealthRiskGauge from './HealthRiskGauge';

// Services
import { healthRiskService } from '@/services/healthRiskService';

export default function HealthModule() {
  const { currentOrganization, currentUser, role } = useHSE();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskScore, setRiskScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const isSupervisor = ['owner', 'admin', 'supervisor', 'manager'].includes(role);

  useEffect(() => {
    if (currentOrganization && currentUser) {
      loadHealthData();
    }
  }, [currentOrganization, currentUser]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const score = await healthRiskService.calculateRiskScore(currentUser.id, currentOrganization.id);
      setRiskScore(score);
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { title: "Fitness Score", value: "85/100", trend: "+5%", icon: Activity, color: "text-green-400" },
    { title: "Med Cert Status", value: "Valid", sub: "Expires in 120 days", icon: Shield, color: "text-blue-400" },
    { title: "Last Screening", value: "12 Oct", sub: "All Clear", icon: Calendar, color: "text-purple-400" },
    { title: "Absence Rate", value: "0%", sub: "This Month", icon: AlertTriangle, color: "text-yellow-400" }
  ];

  return (
    <div className="flex flex-col h-full bg-[#141423] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#2a2a40] bg-[#1a1a2e]">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="text-red-500 fill-current h-6 w-6" /> 
            Health & Wellness Hub
          </h1>
          <p className="text-[#8f8fdb] text-sm">Comprehensive health monitoring and activity tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {isSupervisor && (
            <Button variant="outline" onClick={() => setActiveTab('team-dashboard')} className={`border-[#3a3a5a] hover:bg-[#2a2a40] ${activeTab === 'team-dashboard' ? 'bg-[#2a2a40] text-white' : 'text-[#a0a0b0]'}`}>
              <Users className="mr-2 h-4 w-4" /> Team View
            </Button>
          )}
          <Button variant="outline" onClick={() => setActiveTab('fitness')} className={`border-[#3a3a5a] hover:bg-[#2a2a40] ${activeTab === 'fitness' ? 'bg-[#2a2a40] text-white' : 'text-[#a0a0b0]'}`}>
            <Activity className="mr-2 h-4 w-4" /> Fitness
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-4 bg-[#1a1a2e] border-b border-[#2a2a40]">
            <TabsList className="bg-transparent space-x-2 h-auto p-0">
              <HealthTabTrigger value="dashboard" label="Dashboard" icon={Activity} />
              <HealthTabTrigger value="profile" label="My Profile" icon={Shield} />
              <HealthTabTrigger value="fitness" label="Fitness" icon={Activity} />
              <HealthTabTrigger value="screening" label="Screening" icon={Calendar} />
              <HealthTabTrigger value="exposure" label="Exposures" icon={AlertTriangle} />
              <HealthTabTrigger value="mental" label="Mental Health" icon={Heart} />
              {isSupervisor && <HealthTabTrigger value="compliance" label="Compliance" icon={BookOpen} />}
              {isSupervisor && <HealthTabTrigger value="analytics" label="Analytics" icon={Activity} />}
              {isSupervisor && <HealthTabTrigger value="team-dashboard" label="Team Health" icon={Users} />}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-[#141423]">
            
            <TabsContent value="dashboard" className="space-y-6 m-0 h-full">
              {/* Top Row: Risk Gauge & KPI Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Gauge */}
                <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-white">My Health Risk Score</CardTitle>
                    <CardDescription className="text-[#8f8fdb]">AI-calculated based on exposures & activity</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-4">
                    <HealthRiskGauge score={riskScore} loading={loading} />
                  </CardContent>
                </Card>

                {/* KPI Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dashboardStats.map((stat, i) => (
                    <Card key={i} className="bg-[#1e1e30] border-[#2a2a40] hover:bg-[#25253e] transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[#8f8fdb] text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-white mt-2">{stat.value}</h3>
                            <p className="text-xs text-[#606080] mt-1">{stat.sub || stat.trend}</p>
                          </div>
                          <div className={`p-3 rounded-xl bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Middle Row: Exposure Timeline & Upcoming Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExposureHealthLink summaryView={true} />
                
                <Card className="bg-[#1e1e30] border-[#2a2a40]">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Health Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { title: "Annual Medical Checkup", date: "Oct 15, 2025", type: "Required" },
                        { title: "Flu Vaccination Drive", date: "Nov 01, 2025", type: "Optional" },
                        { title: "Hearing Conservation Test", date: "Nov 12, 2025", type: "Exposure-Based" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#25253e] rounded-lg border border-[#2a2a40]">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.title}</p>
                              <p className="text-xs text-[#8f8fdb]">{item.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-sm">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row: Quick Access */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button variant="ghost" className="h-24 bg-[#1e1e30] border border-[#2a2a40] hover:bg-[#25253e] flex flex-col items-center justify-center gap-2">
                  <Activity className="h-8 w-8 text-green-400" />
                  <span className="text-white font-medium">Log Fitness Activity</span>
                </Button>
                <Button variant="ghost" className="h-24 bg-[#1e1e30] border border-[#2a2a40] hover:bg-[#25253e] flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <span className="text-white font-medium">Report Exposure</span>
                </Button>
                <Button variant="ghost" className="h-24 bg-[#1e1e30] border border-[#2a2a40] hover:bg-[#25253e] flex flex-col items-center justify-center gap-2">
                  <Heart className="h-8 w-8 text-pink-400" />
                  <span className="text-white font-medium">Mental Health Check-in</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fitness" className="m-0 h-full"><FitnessTracking /></TabsContent>
            <TabsContent value="profile" className="m-0 h-full"><HealthProfile /></TabsContent>
            <TabsContent value="screening" className="m-0 h-full"><HealthScreening /></TabsContent>
            <TabsContent value="exposure" className="m-0 h-full"><ExposureHealthLink /></TabsContent>
            <TabsContent value="mental" className="m-0 h-full"><MentalHealthWellness /></TabsContent>
            
            {isSupervisor && (
              <>
                <TabsContent value="compliance" className="m-0 h-full"><HealthCompliance /></TabsContent>
                <TabsContent value="analytics" className="m-0 h-full"><HealthAnalytics /></TabsContent>
                <TabsContent value="team-dashboard" className="m-0 h-full"><TeamHealthDashboard /></TabsContent>
              </>
            )}

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
      className="data-[state=active]:bg-[#25253e] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent text-[#8f8fdb] hover:text-white px-4 py-3 transition-all"
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}