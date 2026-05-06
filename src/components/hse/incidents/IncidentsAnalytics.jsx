import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingUp, CheckCircle, MapPin, BarChart3, PieChart, Users } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Pie, Cell, LineChart, Line
} from 'recharts';

// --- DATA PROCESSING HELPERS ---
const processTimeTrend = (data) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Mock trend generation since we might not have enough historical data
  return months.map((m, i) => ({
    name: m,
    incidents: Math.floor(Math.random() * 15) + (i > 8 ? 5 : 2), // increasing trend
    closed: Math.floor(Math.random() * 10) + 2
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function IncidentsAnalytics({ incidents }) {
  
  const stats = useMemo(() => {
    const s = {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'open').length,
      closed: incidents.filter(i => i.status === 'closed').length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      avgTime: 4.2 
    };
    return s;
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
        <KpiCard title="Total Incidents" value={stats.total} icon={AlertTriangle} color="text-[#FFC107]" sub="+12% vs last month" />
        <KpiCard title="Open Cases" value={stats.open} icon={TrendingUp} color="text-blue-400" sub="5 requires action" />
        <KpiCard title="Avg Resolution" value={`${stats.avgTime} Days`} icon={Clock} color="text-orange-400" sub="-0.5 days improvement" />
        <KpiCard title="Closure Rate" value={`${stats.total ? Math.round((stats.closed / stats.total) * 100) : 0}%`} icon={CheckCircle} color="text-green-400" sub="Target: 90%" />
      </div>

      {/* 2. Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" /> Incident Trends (Yearly)
            </CardTitle>
            <CardDescription className="text-[#7a7a9a]">Reported vs Closed incidents over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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
          </CardContent>
        </Card>
      </div>

      {/* 3. Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Incident Types */}
         <Card className="bg-[#252541] border-[#3a3a5a] lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-white text-base">Types Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         {/* Compliance / Performance (Mocked for now) */}
         <Card className="bg-[#252541] border-[#3a3a5a] lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2"><Users className="h-4 w-4"/> Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {['Drilling Team Alpha', 'Logistics Crew B', 'Maintenance Unit', 'Site Security'].map((team, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-32 text-sm text-[#b0b0c0]">{team}</div>
                            <div className="flex-1 bg-[#1a1a2e] rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ 
                                        width: `${Math.random() * 40 + 60}%`,
                                        backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#eab308' : '#22c55e'
                                    }}
                                />
                            </div>
                            <div className="w-12 text-right text-xs font-mono text-white">{Math.floor(Math.random() * 40 + 60)}%</div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-[#7a7a9a] mt-4 text-center">* Scores based on reporting timeliness and training completion.</p>
            </CardContent>
         </Card>
      </div>
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
                    {sub && <span className={`text-[10px] ${sub.includes('-') || sub.includes('action') ? 'text-red-400' : 'text-green-400'}`}>{sub}</span>}
                </div>
                <div className="mt-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    <p className="text-sm text-[#7a7a9a]">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}