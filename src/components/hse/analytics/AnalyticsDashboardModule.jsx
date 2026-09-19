import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, 
  MapPin, Download, RefreshCw
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
    topLocation: null,
    topLocationCount: 0,
    thisMonth: 0,
    lastMonth: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

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

      // 2. Fetch the organization's reports
      const { data: rawReports } = await analyticsService.getRawReportData(currentOrganization.id);

      // 3. Process Data for Charts (selected range) and month-on-month counts (all reports)
      if (rawReports) {
        processRawData(rawReports, startDate);
      }

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

  const processRawData = (allReports, startDate) => {
    // Month-on-month counts use every report; everything else uses the selected range.
    const thisMonth = allReports.filter(r => new Date(r.created_at) >= startOfMonth(new Date())).length;
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const lastMonth = allReports.filter(r => {
      const d = new Date(r.created_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;

    const reports = allReports.filter(r => new Date(r.created_at) >= startDate);

    // Process Metrics
    const total = reports.length;
    const critical = reports.filter(r => r.severity === 'critical' || r.severity === 'high').length;

    // Location with the most reports in range. Reports without a real location
    // (empty, or the 'Unknown' / 'Detected: Site Location' placeholders the
    // quick report flow writes) are skipped.
    const PLACEHOLDER_LOCATIONS = new Set(['unknown', 'detected: site location']);
    const locCounts = reports.reduce((acc, r) => {
      const loc = (r.location || '').toString().trim();
      if (loc && !PLACEHOLDER_LOCATIONS.has(loc.toLowerCase())) acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    const topLocEntry = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];

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
      topLocation: topLocEntry ? topLocEntry[0] : null,
      topLocationCount: topLocEntry ? topLocEntry[1] : 0,
      thisMonth,
      lastMonth,
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
        ['Total Reports (selected range)', metrics.totalReports],
        ['High or Critical Reports (selected range)', metrics.criticalCount],
        ['Reports This Month', metrics.thisMonth],
        ['Reports Last Month', metrics.lastMonth],
        ['Top Location', metrics.topLocation || 'No data yet']
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
          <p className="text-gray-400 text-sm">Reporting trends from your organization's submitted reports.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard 
          title="Total Reports" 
          value={metrics.totalReports} 
          trend={`${metrics.thisMonth} this month, ${metrics.lastMonth} last month`}
          trendUp={metrics.thisMonth === metrics.lastMonth ? undefined : metrics.thisMonth > metrics.lastMonth}
          icon={Activity}
        />
        <KpiCard 
          title="High / Critical Reports" 
          value={metrics.criticalCount} 
          trend={metrics.totalReports ? `${Math.round((metrics.criticalCount / metrics.totalReports) * 100)}% of reports in range` : 'No data yet'}
          icon={AlertCircle}
          color="text-red-500"
        />
        <KpiCard 
          title="Top Location" 
          value={metrics.topLocation || 'No data yet'} 
          trend={metrics.topLocation ? `${metrics.topLocationCount} reports in range` : 'No locations recorded'}
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
              {chartData.length === 0 ? <EmptyChart /> : (
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
              )}
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
              {severityData.length === 0 ? <EmptyChart /> : (
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

const EmptyChart = () => (
  <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
    No data yet
  </div>
);

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
            <TrendingUp className="h-3 w-3 text-gray-400 mr-1" /> : 
            <TrendingDown className="h-3 w-3 text-gray-400 mr-1" />
        )}
        <span className="text-gray-500">
          {trend}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsDashboardModule;