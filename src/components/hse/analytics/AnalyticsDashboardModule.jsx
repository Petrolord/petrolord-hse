import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, 
  MapPin, Calendar, Download, RefreshCw, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { analyticsService } from '@/services/analyticsService';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboardModule = () => {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    criticalCount: 0,
    avgResolution: 0,
    topLocation: 'N/A',
    trend: 'stable'
  });
  const [chartData, setChartData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchAnalyticsData();
    }
  }, [currentOrganization, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 1. Determine Date Range
      const endDate = new Date();
      let startDate = new Date();
      if (timeRange === '7days') startDate = subDays(endDate, 7);
      if (timeRange === '30days') startDate = subDays(endDate, 30);
      if (timeRange === '90days') startDate = subDays(endDate, 90);

      // 2. Fetch Aggregated Insights
      const { data: insights } = await analyticsService.getInsights(
        currentOrganization.id, 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      );

      // 3. Fetch Raw Data (Fallback/Enrichment)
      const { data: rawReports } = await analyticsService.getRawReportData(currentOrganization.id);
      
      // 4. Process Data for Charts
      if (rawReports) {
        processRawData(rawReports);
      }

      // 5. Get AI Predictions
      const pred = await analyticsService.getPredictiveInsights(currentOrganization.id);
      setPredictions(pred);

    } catch (error) {
      console.error("Analytics Error:", error);
      toast({
        title: "Error fetching analytics",
        description: "Could not load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processRawData = (reports) => {
    // Process Metrics
    const total = reports.length;
    const critical = reports.filter(r => r.severity === 'critical' || r.severity === 'high').length;
    
    // Process Trend (Simple Comparison)
    const thisMonth = reports.filter(r => new Date(r.created_at) > startOfMonth(new Date())).length;
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const lastMonth = reports.filter(r => {
      const d = new Date(r.created_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
    
    const trendDirection = thisMonth >= lastMonth ? 'up' : 'down';

    // Process Charts - Severity
    const sevCounts = reports.reduce((acc, r) => {
      acc[r.severity || 'low'] = (acc[r.severity || 'low'] || 0) + 1;
      return acc;
    }, {});
    const sevData = Object.entries(sevCounts).map(([name, value]) => ({ name, value }));

    // Process Charts - Category
    const catCounts = reports.reduce((acc, r) => {
      acc[r.category || 'General'] = (acc[r.category || 'General'] || 0) + 1;
      return acc;
    }, {});
    const catData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

    // Process Charts - Activity Over Time
    const activityMap = reports.reduce((acc, r) => {
      const date = format(new Date(r.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const activityData = Object.entries(activityMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));

    setMetrics({
      totalReports: total,
      criticalCount: critical,
      avgResolution: 24, // Mock for now
      topLocation: 'Drill Site A', // Mock for now
      trend: trendDirection
    });
    setSeverityData(sevData);
    setCategoryData(catData);
    setChartData(activityData);
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text(`Analytics Report: ${currentOrganization?.name}`, 14, 20);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Reports', metrics.totalReports],
        ['Critical Incidents', metrics.criticalCount],
        ['Trend', metrics.trend.toUpperCase()],
        ['AI Risk Prediction', predictions?.riskLevel || 'N/A']
      ]
    });

    doc.save(`analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: "Export Started", description: "Your PDF report is downloading." });
  };

  function subMonths(date, months) {
      const d = new Date(date);
      d.setMonth(d.getMonth() - months);
      return d;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC107]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-[#1a1a2e] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Advanced Analytics</h1>
          <p className="text-gray-400 text-sm">AI-driven insights and operational trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-[#252541] border-[#3a3a5a] text-white">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" className="bg-[#252541] border-[#3a3a5a] text-white hover:bg-[#2d2d4a]">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={fetchAnalyticsData} size="icon" className="bg-[#FFC107] text-black hover:bg-[#FFC107]/90">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Reports" 
          value={metrics.totalReports} 
          trend={metrics.trend === 'up' ? '+12%' : '-5%'} 
          trendUp={metrics.trend === 'up'}
          icon={Activity}
        />
        <KpiCard 
          title="Critical Incidents" 
          value={metrics.criticalCount} 
          trend="Stable" 
          icon={AlertCircle}
          color="text-red-500"
        />
        <KpiCard 
          title="AI Risk Forecast" 
          value={predictions?.riskLevel || 'Analyzing...'} 
          trend="Next 7 Days"
          icon={Zap}
          color="text-purple-500"
        />
        <KpiCard 
          title="Top Location" 
          value={metrics.topLocation} 
          trend="Most Reports" 
          icon={MapPin}
          color="text-blue-500"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-[#1e1e2d] border-[#2d2d4a]">
          <CardHeader>
            <CardTitle className="text-white">Reporting Activity</CardTitle>
            <CardDescription className="text-gray-400">Submission volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFC107" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{fill: '#6b7280'}} />
                  <YAxis stroke="#6b7280" tick={{fill: '#6b7280'}} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#FFC107" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Pie Chart */}
        <Card className="bg-[#1e1e2d] border-[#2d2d4a]">
          <CardHeader>
            <CardTitle className="text-white">Severity Distribution</CardTitle>
            <CardDescription className="text-gray-400">By incident level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="bg-[#1e1e2d] border-[#2d2d4a] border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-white">Predictive AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#252541] rounded-lg">
              <span className="text-sm text-gray-400 block mb-1">Projected Incidents (Next 7 Days)</span>
              <span className="text-2xl font-bold text-white">{predictions?.predictedIncidentsNextWeek || 0}</span>
            </div>
            <div className="p-4 bg-[#252541] rounded-lg">
              <span className="text-sm text-gray-400 block mb-1">High Risk Location</span>
              <span className="text-lg font-semibold text-orange-400">{predictions?.highRiskLocation || 'Calculating...'}</span>
            </div>
            <div className="p-4 bg-[#252541] rounded-lg">
              <span className="text-sm text-gray-400 block mb-1">Recommended Action</span>
              <span className="text-sm text-white">{predictions?.recommendedAction || 'No immediate action required.'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KpiCard = ({ title, value, trend, trendUp, icon: Icon, color = "text-[#FFC107]" }) => (
  <Card className="bg-[#1e1e2d] border-[#2d2d4a]">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-opacity-10 bg-white`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <div className="flex items-center text-xs">
        {trendUp !== undefined && (
          trendUp ? 
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" /> : 
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
        )}
        <span className={trendUp ? "text-green-500" : "text-gray-500"}>
          {trend}
        </span>
        <span className="text-gray-500 ml-1">vs last period</span>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsDashboardModule;