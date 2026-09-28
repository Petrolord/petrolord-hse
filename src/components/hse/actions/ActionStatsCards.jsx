import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, PlayCircle, ShieldQuestion, ListTodo } from 'lucide-react';

// A KPI tile on the theme roles (design family, batch 1B): label, mono value
// and a neutral icon; the title names the status, so no hue is needed.
const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-pl-muted text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{value}</p>
      </div>
      <div className="hidden sm:block shrink-0 p-2 rounded-lg bg-pl-sunken border border-pl-border text-pl-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </CardContent>
  </Card>
);

export default function ActionStatsCards({ actions = [] }) {
  const counts = {
    total: actions.length,
    open: actions.filter(a => a.status === 'open').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    pending: actions.filter(a => a.status === 'pending_approval').length,
    closed: actions.filter(a => a.status === 'closed').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard 
        title="TOTAL ACTIONS" 
        value={counts.total} 
        icon={ListTodo} 
      />
      <StatCard 
        title="OPEN" 
        value={counts.open} 
        icon={Clock} 
      />
      <StatCard 
        title="IN PROGRESS" 
        value={counts.inProgress} 
        icon={PlayCircle} 
      />
      <StatCard 
        title="PENDING APPROVAL" 
        value={counts.pending} 
        icon={ShieldQuestion} 
      />
      <StatCard 
        title="CLOSED" 
        value={counts.closed} 
        icon={CheckCircle2} 
      />
    </div>
  );
}