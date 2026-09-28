import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { predictiveAnalyticsService } from '@/services/predictiveAnalyticsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Brain, TrendingUp, AlertTriangle, Activity, ShieldCheck, BarChart3, LayoutGrid, RotateCw, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import RecommendationDashboard from './RecommendationDashboard';
import AdvancedDashboard from './AdvancedDashboard';
import ContinuousLearningDashboard from './ContinuousLearningDashboard';
import ForecastView from './ForecastView';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES, GRID_STYLE, AXIS_PROPS, TOOLTIP_STYLE, LEGEND_PROPS } from '@/utils/chartTheme';

// Design system (wave 0 pilot). Rendered by the dashboard (embedded) and by
// the AI Analytics module, both inside the signed-in scope, so the theme
// roles are used directly. The trend chart sits on a white ChartPanel in
// both themes with the chart standard's colours.
const INCIDENT_COLOR = CHART_SERIES[3];
const NEAR_MISS_COLOR = CHART_SERIES[2];

// The Advanced Analytics / Continuous Learning / Recommendations tabs render
// hardcoded demo data (and the recommendation engine seeded fabricated rows
// into the customer's database). They are withheld from the launch build
// until they run on real data; only the flag below re-enables them.
const SHOW_PREVIEW_TABS = false;

export default function PredictiveInsightsDashboard({ isEmbedded = false }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // AI forecast state
  const [forecast, setForecast] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadData();
      loadForecast();
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

  const loadForecast = async () => {
    try {
      const [latest, acc] = await Promise.all([
        predictiveAnalyticsService.getLatestForecast(currentOrganization.id),
        predictiveAnalyticsService.getForecastAccuracy(currentOrganization.id),
      ]);
      setForecast(latest);
      setAccuracy(acc);
    } catch (e) {
      console.error("Forecast load error:", e);
    }
  };

  const handleGenerateForecast = async () => {
    if (!currentOrganization?.id) return;
    setGenerating(true);
    try {
      const result = await predictiveAnalyticsService.generateForecast(currentOrganization.id);
      setForecast(result);
      const acc = await predictiveAnalyticsService.getForecastAccuracy(currentOrganization.id);
      setAccuracy(acc);
      toast({ title: "Forecast generated", description: "AI safety forecast updated from your latest reports." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not generate forecast", description: e.message || "The AI service is unavailable.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-pl-muted">Loading Predictive Engine Data...</div>;
  }

  const { metrics, trends, risk_factors } = data || {};

  return (
    <div className={`text-pl-text ${isEmbedded ? '' : 'p-4 sm:p-6 min-h-screen space-y-8'}`}>
      
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-pl-display text-3xl sm:text-4xl font-semibold text-pl-text flex items-center gap-3">
              <Brain className="h-8 w-8 text-pl-primary-text" aria-hidden="true" />
              Petrolord AI Safety Predictor
            </h1>
            <p className="text-pl-muted mt-1">
              AI safety forecast and metrics computed from your organization's reports.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              Refresh Data
            </Button>
            <Button>
              Generate Report
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forecast" className="flex gap-2">
            <Sparkles className="h-4 w-4" /> AI Forecast
          </TabsTrigger>
          {SHOW_PREVIEW_TABS && (
            <>
              <TabsTrigger value="advanced" className="flex gap-2">
                <LayoutGrid className="h-4 w-4" /> Advanced Analytics
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex gap-2">
                <RotateCw className="h-4 w-4" /> Continuous Learning
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex gap-2">
                <ShieldCheck className="h-4 w-4" /> Recommendations
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="analytics" className="flex gap-2">
            <Activity className="h-4 w-4" /> Basic Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <ForecastView
            forecast={forecast}
            accuracy={accuracy}
            generating={generating}
            onGenerate={handleGenerateForecast}
          />
        </TabsContent>

        {SHOW_PREVIEW_TABS && (
          <>
            <TabsContent value="advanced" className="min-h-[800px]">
              <AdvancedDashboard />
            </TabsContent>

            <TabsContent value="learning" className="min-h-[800px]">
              <ContinuousLearningDashboard />
            </TabsContent>

            <TabsContent value="recommendations">
              <RecommendationDashboard />
            </TabsContent>
          </>
        )}

        <TabsContent value="analytics" className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Incident Frequency" 
              value={metrics?.incident_count || 0} 
              trend="past 6 months"
              icon={AlertTriangle}
            />
            <KpiCard 
              title="Near-Miss Ratio" 
              value={metrics?.nm_incident_ratio != null ? `${metrics.nm_incident_ratio} : 1` : "Not enough data"} 
              trend="leading indicator"
              icon={Activity}
            />
            <KpiCard 
              title="Action Closure Rate" 
              value={metrics?.action_closure_rate != null ? `${metrics.action_closure_rate}%` : "No data yet"} 
              trend="operational efficiency"
              icon={ShieldCheck}
            />
            <KpiCard 
              title="Avg. Compliance" 
              value={metrics?.avg_compliance_score != null ? `${metrics.avg_compliance_score}%` : "No data yet"} 
              trend="audit performance"
              icon={BarChart3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartPanel
              className="lg:col-span-2"
              title="Incident and Near Miss Trends"
              subtitle="Historical data pattern analysis"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={INCIDENT_COLOR} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={INCIDENT_COLOR} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={NEAR_MISS_COLOR} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={NEAR_MISS_COLOR} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="date" {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: CHART_COLORS.tooltipText }}
                      itemStyle={{ color: CHART_COLORS.tooltipText }}
                    />
                    <Legend {...LEGEND_PROPS} />
                    <Area type="monotone" dataKey="incidents" stroke={INCIDENT_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                    <Area type="monotone" dataKey="nearmisses" stroke={NEAR_MISS_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorNM)" name="Near Misses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Detected Risk Factors
                </CardTitle>
                <CardDescription>AI-identified areas of concern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risk_factors && risk_factors.length > 0 ? (
                    risk_factors.map((risk, index) => (
                      <div key={index} className="p-3 rounded-md bg-pl-sunken border border-pl-border flex gap-3 items-start">
                        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          risk.severity === 'High' ? 'bg-pl-danger' : 'bg-pl-warning'
                        }`} aria-hidden="true" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-pl-text capitalize">{risk.type.replace(/_/g, ' ')}</h4>
                          <p className="text-xs text-pl-muted mt-1">{risk.message}</p>
                          {risk.severity && (
                            <Badge variant={risk.severity === 'High' ? 'danger' : 'warning'} className="mt-2">{risk.severity}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-pl-muted">
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

function KpiCard({ title, value, trend, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="p-2 rounded-lg bg-pl-sunken text-pl-muted">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <Badge variant="neutral" className="text-[10px] uppercase">
            {trend}
          </Badge>
        </div>
        <div className="space-y-1">
          <h3 className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{value}</h3>
          <p className="text-sm text-pl-muted">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}