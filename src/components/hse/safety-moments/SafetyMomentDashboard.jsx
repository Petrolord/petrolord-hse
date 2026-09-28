import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users } from 'lucide-react';

export default function SafetyMomentDashboard({ moments = [] }) {
  // Design family (batch 2C): stat tiles on the theme roles, numbers in the
  // mono face, icons in a neutral tile (colour is kept for status).
  const StatCard = ({ title, value, icon: Icon }) => (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-pl-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-semibold text-pl-text mt-1 font-pl-mono tabular-nums">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-pl-sunken">
          <Icon className="h-6 w-6 text-pl-muted" aria-hidden="true" />
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
    : 'n/a';
  const topCategory = categoryEntries[0];
  const topShare = topCategory && moments.length ? Math.round((topCategory[1] / moments.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <StatCard title="Total Moments" value={moments.length} icon={BookOpen} />
        <StatCard title="Categories" value={categoryEntries.length} icon={Users} />
        <StatCard title="Avg Duration" value={avgDuration} icon={Clock} />
      </div>

      <div className="bg-pl-surface rounded-xl border border-pl-border shadow-pl-sm p-6">
         <h3 className="text-lg font-semibold text-pl-text mb-4">Quick Stats</h3>
         {topCategory ? (
           <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                 <span className="text-pl-muted">Largest Category</span>
                 <span className="text-pl-text font-medium">{topCategory[0]} (<span className="font-pl-mono tabular-nums">{topCategory[1]}</span> of <span className="font-pl-mono tabular-nums">{moments.length}</span>)</span>
              </div>
              <div className="w-full bg-pl-sunken h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-pl-primary" style={{ width: `${topShare}%` }} />
              </div>
              <div className="flex justify-between items-center mt-4">
                 <span className="text-pl-muted">Completion Rate</span>
                 <span className="text-pl-muted font-medium">No data yet</span>
              </div>
           </div>
         ) : (
           <p className="text-pl-muted text-sm">No data yet</p>
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