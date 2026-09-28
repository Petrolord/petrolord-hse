import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import ChartFrame from '@/components/charts/ChartFrame';
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, 
  MapPin, Download, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChartPanel } from '@/components/ui/chart-panel';
import { CHART_COLORS, CHART_SERIES, GRID_STYLE, AXIS_PROPS, TOOLTIP_STYLE, LEGEND_PROPS } from '@/utils/chartTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { analyticsService } from '@/services/analyticsService';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Charts stay white in both themes (ChartPanel) with the chart theme colours.
const TOOLTIP = {
  contentStyle: TOOLTIP_STYLE,
  itemStyle: { color: CHART_COLORS.tooltipText },
  labelStyle: { color: CHART_COLORS.axisText },
};
// Severity slices from the validated series, in the Risk module's order; the
// legend names each one.
const SEVERITY_COLORS = { critical: CHART_SERIES[3], high: CHART_SERIES[2], medium: CHART_SERIES[0], low: CHART_SERIES[1] };

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
      <div className="flex items-center justify-center h-[500px]" role="status" aria-label="Loading analytics">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pl-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-pl-display text-2xl font-bold text-pl-text mb-1">Advanced Analytics</h1>
          <p className="text-pl-muted text-sm">Reporting trends from your organization's submitted reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]" aria-label="Time range">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Export PDF
          </Button>
          <Button onClick={fetchAnalyticsData} size="icon" aria-label="Refresh">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
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
        />
        <KpiCard 
          title="Top Location" 
          value={metrics.topLocation || 'No data yet'} 
          trend={metrics.topLocation ? `${metrics.topLocationCount} reports in range` : 'No locations recorded'}
          icon={MapPin}
        />
      </div>

      {/* Main Charts Row: white chart panels in both themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <ChartPanel title="Reporting Activity" subtitle="Submission volume over time" className="lg:col-span-2 p-5">
          {chartData.length === 0 ? <div className="h-[300px]"><EmptyChart /></div> : (
            <ChartFrame height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES[0]} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={CHART_SERIES[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <RechartsTooltip {...TOOLTIP} />
                <Area type="monotone" dataKey="count" name="Reports" stroke={CHART_SERIES[0]} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ChartFrame>
          )}
        </ChartPanel>

        {/* Severity Pie Chart */}
        <ChartPanel title="Severity Distribution" subtitle="By incident level" className="p-5">
          {severityData.length === 0 ? <div className="h-[300px]"><EmptyChart /></div> : (
            <ChartFrame height={300}>
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
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || CHART_SERIES[4]} />
                  ))}
                </Pie>
                <RechartsTooltip {...TOOLTIP} />
                <Legend {...LEGEND_PROPS} />
              </PieChart>
            </ChartFrame>
          )}
        </ChartPanel>
      </div>

    </div>
  );
};

const EmptyChart = () => (
  <div className="h-full w-full flex items-center justify-center text-sm text-pl-muted">
    No data yet
  </div>
);

// Neutral icon, mono count; a word ("No data yet", a location) reads in the body face.
const KpiCard = ({ title, value, trend, trendUp, icon: Icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-pl-muted">{title}</p>
          {typeof value === 'number'
            ? <h3 className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text mt-1">{value}</h3>
            : <h3 className="text-xl font-semibold text-pl-text mt-1 break-words">{value}</h3>}
        </div>
        <div className="shrink-0 p-2 rounded-lg bg-pl-sunken border border-pl-border text-pl-muted">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center text-xs text-pl-muted">
        {trendUp !== undefined && (
          trendUp ? 
            <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" /> : 
            <TrendingDown className="h-3 w-3 mr-1" aria-hidden="true" />
        )}
        <span>
          {trend}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsDashboardModule;