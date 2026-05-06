import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, PlayCircle, ShieldQuestion, ListTodo } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <Card className="bg-[#252541] border-[#3a3a5a]">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-[#7a7a9a] text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-[#1a1a2e] border border-[#3a3a5a]`}>
        <Icon className={`h-5 w-5 ${color}`} />
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
        color="text-white" 
      />
      <StatCard 
        title="OPEN" 
        value={counts.open} 
        icon={Clock} 
        color="text-blue-400" 
      />
      <StatCard 
        title="IN PROGRESS" 
        value={counts.inProgress} 
        icon={PlayCircle} 
        color="text-yellow-400" 
      />
      <StatCard 
        title="PENDING APPROVAL" 
        value={counts.pending} 
        icon={ShieldQuestion} 
        color="text-purple-400" 
      />
      <StatCard 
        title="CLOSED" 
        value={counts.closed} 
        icon={CheckCircle2} 
        color="text-green-400" 
      />
    </div>
  );
}