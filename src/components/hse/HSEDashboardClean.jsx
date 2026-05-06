import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHSE } from '@/context/HSEContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Activity, 
  Droplets, 
  FileText,
  Zap,
  Flame,
  Lock
} from 'lucide-react';
import TeamLeaderboard from '@/components/gamification/TeamLeaderboard';
import SafetyScore from '@/components/gamification/SafetyScore';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';

const KPICard = ({ title, value, subtext, icon: Icon, trend }) => (
  <Card className="bg-[#1e1e2d] border-[#2d2d4a] text-white">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
          </div>
        </div>
        <div className="p-2 bg-[#2d2d4a] rounded-lg">
          <Icon className="h-5 w-5 text-[#FFC107]" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={trend > 0 ? "text-red-400" : "text-green-400"}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const ChartSection = () => {
  // Mock data for the visual
  const data = [
    { name: '2025-08', incidents: 0, nearmisses: 0 },
    { name: '2025-09', incidents: 0, nearmisses: 0 },
    { name: '2025-10', incidents: 0, nearmisses: 0 },
    { name: '2025-11', incidents: 0, nearmisses: 0 },
    { name: '2025-12', incidents: 0, nearmisses: 0 },
    { name: '2026-01', incidents: 0, nearmisses: 0 },
  ];

  return (
    <Card className="bg-[#1e1e2d] border-[#2d2d4a] text-white h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#FFC107] flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Incident & Near Miss Trends
        </CardTitle>
        <p className="text-xs text-gray-500">Historical data pattern analysis</p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#2d2d4a', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="incidents" name="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="nearmisses" name="Near Misses" fill="#FFC107" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskFactorsSection = () => (
  <Card className="bg-[#1e1e2d] border-[#2d2d4a] text-white h-full">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-[#FFC107] flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Detected Risk Factors
      </CardTitle>
      <p className="text-xs text-gray-500">AI-identified areas of concern</p>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center h-[250px] text-center p-6">
      <div className="h-16 w-16 bg-[#2d2d4a] rounded-full flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-green-500" />
      </div>
      <p className="text-sm text-gray-400">No critical risk factors detected currently.</p>
    </CardContent>
  </Card>
);

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#1e1e2d] border border-[#2d2d4a] rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <span className="text-xs font-medium text-gray-400 uppercase">{label}</span>
    </div>
    <span className="text-xl font-bold text-white">{value}</span>
  </div>
);

export default function HSEDashboardClean() {
  const { currentUser } = useHSE();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {currentUser?.user_metadata?.full_name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2d2d4a] text-gray-300 hover:bg-[#2d2d4a] hover:text-white">
            Last 30 Days
          </Button>
          <Button className="bg-[#FFC107] text-black hover:bg-[#ffb300]">
            <Zap className="h-4 w-4 mr-2" /> Quick Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Incident Frequency" value="0" icon={AlertCircle} />
        <KPICard title="Near-Miss Ratio" value="0:0" icon={AlertTriangle} />
        <KPICard title="Action Closure Rate" value="0%" icon={CheckCircle2} />
        <KPICard title="Avg. Compliance" value="0%" icon={Shield} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[350px]">
        <div className="lg:col-span-2 h-full">
          <ChartSection />
        </div>
        <div className="h-full">
          <RiskFactorsSection />
        </div>
      </div>

      {/* Scores & Badges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Safety Score + Badges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SafetyScore />
            <BadgesDisplay />
          </div>
          
          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatPill icon={Activity} label="Health Score" value="88%" color="text-green-500" />
            <StatPill icon={Lock} label="Security Incidents" value="0" color="text-red-500" />
            <StatPill icon={Droplets} label="Env Score" value="89%" color="text-blue-500" />
            <StatPill icon={FileText} label="Permits Active" value="8" color="text-orange-500" />
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="h-full">
          <TeamLeaderboard />
        </div>
      </div>
    </div>
  );
}