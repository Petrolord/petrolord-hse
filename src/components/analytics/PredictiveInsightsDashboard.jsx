import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { predictiveAnalyticsService } from '@/services/predictiveAnalyticsService';
import { recommendationEngine } from '@/services/recommendationEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, TrendingUp, AlertTriangle, Activity, ShieldCheck, BarChart3, CloudRain, LayoutGrid, RotateCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import RecommendationDashboard from './RecommendationDashboard';
import AdvancedDashboard from './AdvancedDashboard';
import ContinuousLearningDashboard from './ContinuousLearningDashboard'; // New Import

export default function PredictiveInsightsDashboard({ isEmbedded = false }) {
  const { currentOrganization } = useHSE();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadData();
      recommendationEngine.initializeDemoData(currentOrganization.id);
    }
  }, [currentOrganization]);

  const loadData = async () => {
    setLoading(true);
    try {
      const aggregatedData = await predictiveAnalyticsService.getAggregatedSafetyData(currentOrganization.id);
      setData(aggregatedData);
    } catch (error) {
      console.error("Analytics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#7a7a9a]">Loading Predictive Engine Data...</div>;
  }

  const { metrics, trends, risk_factors } = data || {};

  return (
    <div className={`bg-[#0F1B2E] text-white ${isEmbedded ? '' : 'p-6 min-h-screen space-y-8'}`}>
      
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-[#8b5cf6]" />
              Petrolord AI Safety Predictor
              <Badge variant="outline" className="ml-2 border-[#8b5cf6] text-[#8b5cf6] bg-[#8b5cf6]/10">PHASE 5: OPTIMIZED</Badge>
            </h1>
            <p className="text-[#7a7a9a] mt-1">
              Aggregated safety intelligence and continuous learning optimization.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white">
              Refresh Data
            </Button>
            <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
              Generate Report
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue={isEmbedded ? "analytics" : "advanced"} className="space-y-6">
        <TabsList className="bg-[#1a1a2e] border border-[#3a3a5a]">
          <TabsTrigger value="advanced" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <LayoutGrid className="h-4 w-4" /> Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <RotateCw className="h-4 w-4" /> Continuous Learning
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <ShieldCheck className="h-4 w-4" /> Recommendations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <Activity className="h-4 w-4" /> Basic Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="min-h-[800px]">
          <AdvancedDashboard />
        </TabsContent>

        <TabsContent value="learning" className="min-h-[800px]">
          <ContinuousLearningDashboard />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Incident Frequency" 
              value={metrics?.incident_count || 0} 
              trend="past 6 months"
              icon={AlertTriangle}
              color="text-red-400"
            />
            <KpiCard 
              title="Near-Miss Ratio" 
              value={metrics?.nm_incident_ratio || "0:0"} 
              trend="leading indicator"
              icon={Activity}
              color="text-yellow-400"
            />
            <KpiCard 
              title="Action Closure Rate" 
              value={`${metrics?.action_closure_rate || 0}%`} 
              trend="operational efficiency"
              icon={ShieldCheck}
              color="text-green-400"
            />
            <KpiCard 
              title="Avg. Compliance" 
              value={`${metrics?.avg_compliance_score || 0}%`} 
              trend="audit performance"
              icon={BarChart3}
              color="text-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a2e] border-[#3a3a5a] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#8b5cf6]" /> Incident & Near Miss Trends
                </CardTitle>
                <CardDescription className="text-[#7a7a9a]">Historical data pattern analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" vertical={false} />
                    <XAxis dataKey="date" stroke="#7a7a9a" />
                    <YAxis stroke="#7a7a9a" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                    <Area type="monotone" dataKey="nearmisses" stroke="#facc15" fillOpacity={1} fill="url(#colorNM)" name="Near Misses" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" /> Detected Risk Factors
                </CardTitle>
                <CardDescription className="text-[#7a7a9a]">AI-identified areas of concern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risk_factors && risk_factors.length > 0 ? (
                    risk_factors.map((risk, index) => (
                      <div key={index} className="p-3 rounded bg-[#252541] border border-[#3a3a5a] flex gap-3 items-start">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          risk.severity === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h4 className="text-sm font-semibold text-white capitalize">{risk.type.replace('_', ' ')}</h4>
                          <p className="text-xs text-[#b0b0c0] mt-1">{risk.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#7a7a9a]">
                      <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No critical risk factors detected currently.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ title, value, trend, icon: Icon, color }) {
  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-[#252541] ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="bg-[#252541] text-[#7a7a9a] border-none text-[10px] uppercase">
            {trend}
          </Badge>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm text-[#7a7a9a]">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}