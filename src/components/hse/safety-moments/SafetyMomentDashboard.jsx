import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, TrendingUp, Users } from 'lucide-react';

export default function SafetyMomentDashboard({ totalMoments }) {
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-[#252541] border-[#3a3a5a]">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#7a7a9a] uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color: color }} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Moments" value={totalMoments || 0} icon={BookOpen} color="#10b981" />
        <StatCard title="Categories" value="8" icon={Users} color="#3b82f6" />
        <StatCard title="Avg Duration" value="8m" icon={Clock} color="#f59e0b" />
        <StatCard title="Engagement" value="High" icon={TrendingUp} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#252541] rounded-xl border border-[#3a3a5a] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Featured Topic of the Week</h3>
          <div className="bg-gradient-to-r from-emerald-900/40 to-[#1f1f35] border border-emerald-500/20 rounded-lg p-6 relative overflow-hidden">
             <div className="relative z-10">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 block">Mental Health & Wellness</span>
                <h2 className="text-2xl font-bold text-white mb-2">Combating Fatigue in High-Risk Zones</h2>
                <p className="text-[#b0b0c0] max-w-xl mb-4">
                   Fatigue impairment can be as dangerous as intoxication. Learn the biological signs and how to implement effective countermeasures on site.
                </p>
                <div className="flex items-center gap-4 text-sm text-[#7a7a9a]">
                   <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> 10 min</span>
                   <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current"/> Highly Rated</span>
                </div>
             </div>
             <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="bg-[#252541] rounded-xl border border-[#3a3a5a] p-6">
           <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[#b0b0c0]">Most Popular Category</span>
                 <span className="text-emerald-400 font-medium">Workplace Hazards</span>
              </div>
              <div className="w-full bg-[#1a1a2e] h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[65%]" />
              </div>
              
              <div className="flex justify-between items-center mt-4">
                 <span className="text-[#b0b0c0]">Completion Rate</span>
                 <span className="text-blue-400 font-medium">88%</span>
              </div>
              <div className="w-full bg-[#1a1a2e] h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[88%]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Helper icon
function Clock(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}