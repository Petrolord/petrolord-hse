import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users } from 'lucide-react';

export default function SafetyMomentDashboard({ moments = [] }) {
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

  // All figures below are computed from the moments currently loaded in the library.
  const categoryCounts = moments.reduce((acc, m) => {
    const name = m.category?.name;
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const durations = moments.map(m => Number(m.duration)).filter(d => Number.isFinite(d) && d > 0);
  const avgDuration = durations.length
    ? `${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}m`
    : '--';
  const topCategory = categoryEntries[0];
  const topShare = topCategory && moments.length ? Math.round((topCategory[1] / moments.length) * 100) : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Moments" value={moments.length} icon={BookOpen} color="#10b981" />
        <StatCard title="Categories" value={categoryEntries.length} icon={Users} color="#3b82f6" />
        <StatCard title="Avg Duration" value={avgDuration} icon={Clock} color="#f59e0b" />
      </div>

      <div className="bg-[#252541] rounded-xl border border-[#3a3a5a] p-6">
         <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
         {topCategory ? (
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[#b0b0c0]">Largest Category</span>
                 <span className="text-emerald-400 font-medium">{topCategory[0]} ({topCategory[1]} of {moments.length})</span>
              </div>
              <div className="w-full bg-[#1a1a2e] h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: `${topShare}%` }} />
              </div>
              <div className="flex justify-between items-center mt-4">
                 <span className="text-[#b0b0c0]">Completion Rate</span>
                 <span className="text-[#7a7a9a] font-medium">No data yet</span>
              </div>
           </div>
         ) : (
           <p className="text-[#7a7a9a] text-sm">No data yet</p>
         )}
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