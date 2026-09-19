import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingUp, CheckCircle, BarChart3, PieChart } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Pie, Cell, PieChart as RePieChart
} from 'recharts';

// --- DATA PROCESSING HELPERS ---
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// When the incident happened, falling back to when it was reported.
const occurredAt = (incident) => toDate(incident.incident_date) || toDate(incident.created_at);

const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;

// Real monthly counts for the trailing 12 months (current month included):
// reports grouped by incident date, closures grouped by closed_at.
const processTimeTrend = (data, now = new Date()) => {
  const buckets = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(d),
      name: `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
      incidents: 0,
      closed: 0,
    });
  }
  const byKey = Object.fromEntries(buckets.map(b => [b.key, b]));
  data.forEach(inc => {
    const occurred = occurredAt(inc);
    if (occurred && byKey[monthKey(occurred)]) byKey[monthKey(occurred)].incidents += 1;
    const closed = toDate(inc.closed_at);
    if (closed && byKey[monthKey(closed)]) byKey[monthKey(closed)].closed += 1;
  });
  return buckets.map(({ key, ...rest }) => rest);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function IncidentsAnalytics({ incidents }) {
  
  const stats = useMemo(() => {
    const closedIncidents = incidents.filter(i => i.status === 'closed');

    // Average resolution only from incidents that carry both dates.
    const resolutionDays = closedIncidents
      .map(i => {
        const start = occurredAt(i);
        const end = toDate(i.closed_at);
        if (!start || !end || end < start) return null;
        return (end - start) / (1000 * 60 * 60 * 24);
      })
      .filter(v => v !== null);
    const avgTime = resolutionDays.length
      ? (resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length).toFixed(1)
      : null;

    const now = new Date();
    const thisMonth = incidents.filter(i => {
      const d = occurredAt(i);
      return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    return {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'open').length,
      closed: closedIncidents.length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      avgTime,
      resolvedSample: resolutionDays.length,
      closedWithoutDate: closedIncidents.filter(i => !toDate(i.closed_at)).length,
      thisMonth,
    };
  }, [incidents]);

  const chartData = useMemo(() => {
    // 1. Severity Distribution
    const severity = [
        { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#22c55e' },
        { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, color: '#eab308' },
        { name: 'High', value: incidents.filter(i => i.severity === 'high').length, color: '#f97316' },
        { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // 2. Type Distribution
    const typesMap = incidents.reduce((acc, curr) => {
        const type = curr.report_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const types = Object.keys(typesMap).map((k, i) => ({ name: k, value: typesMap[k], color: COLORS[i % COLORS.length] }));

    // 3. Trend Data
    const trends = processTimeTrend(incidents);

    return { severity, types, trends };
  }, [incidents]);

  return (
    <div className="space-y-6 p-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a3a5a]">
      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Incidents" value={stats.total} icon={AlertTriangle} color="text-[#FFC107]" sub={`${stats.thisMonth} this month`} />
        <KpiCard title="Open Cases" value={stats.open} icon={TrendingUp} color="text-blue-400" />
        <KpiCard
          title="Avg Resolution"
          value={stats.avgTime !== null ? `${stats.avgTime} Days` : 'Not enough data'}
          icon={Clock}
          color="text-orange-400"
          sub={stats.avgTime !== null ? `from ${stats.resolvedSample} closed with a close date` : null}
        />
        <KpiCard title="Closure Rate" value={stats.total ? `${Math.round((stats.closed / stats.total) * 100)}%` : 'No data yet'} icon={CheckCircle} color="text-green-400" />
      </div>

      {/* 2. Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" /> Incident Trends (Last 12 Months)
            </CardTitle>
            <CardDescription className="text-[#7a7a9a]">
              Reported incidents by incident date, closures by close date
              {stats.closedWithoutDate > 0 && ` (${stats.closedWithoutDate} closed without a recorded close date are not plotted)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.total === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trends}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" />
                <XAxis dataKey="name" stroke="#7a7a9a" />
                <YAxis stroke="#7a7a9a" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#3a3a5a', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="incidents" stroke="#8884d8" fillOpacity={1} fill="url(#colorIncidents)" name="New Reports" />
                <Area type="monotone" dataKey="closed" stroke="#82ca9d" fillOpacity={1} fill="url(#colorClosed)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-400" /> Severity Breakdown
            </CardTitle>
            <CardDescription className="text-[#7a7a9a]">Distribution of incidents by impact level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {chartData.severity.length === 0 ? <EmptyChart /> : (
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.severity} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" horizontal={false} />
                    <XAxis type="number" stroke="#7a7a9a" />
                    <YAxis dataKey="name" type="category" stroke="#fff" width={80} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#3a3a5a', color: '#fff' }}
                        cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                        {chartData.severity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Secondary Metrics Row */}
      <div className="grid grid-cols-1 gap-6">
         {/* Incident Types */}
         <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
                <CardTitle className="text-white text-base">Types Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex justify-center">
                {chartData.types.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={chartData.types}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.types.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#3a3a5a', color: '#fff' }} />
                        <Legend verticalAlign="bottom" height={36} />
                    </RePieChart>
                </ResponsiveContainer>
                )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-[#7a7a9a]">
            No data yet
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color, sub }) {
    return (
        <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded-lg bg-[#1a1a2e] border border-[#3a3a5a]">
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    {sub && <span className="text-[10px] text-[#7a7a9a] text-right">{sub}</span>}
                </div>
                <div className="mt-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    <p className="text-sm text-[#7a7a9a]">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}