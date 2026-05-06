import React from 'react';
import { ClipboardList, AlertTriangle, Clock, CheckCircle2, Archive } from 'lucide-react';

export default function SupervisorStats({ stats }) {
  const items = [
    { label: 'Total Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { label: 'Critical Issues', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'In Progress', value: stats.inProgress, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Closed This Week', value: stats.closedThisWeek, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className={`p-4 rounded-xl border ${item.bg} ${item.border} flex items-center justify-between`}>
            <div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
            </div>
            <div className={`p-3 rounded-full bg-[var(--bg-app)] border border-[#3a3a5a]`}>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}