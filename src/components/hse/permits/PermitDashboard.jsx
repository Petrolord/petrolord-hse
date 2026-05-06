import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PermitDashboard({ stats }) {
  const cards = [
    { title: "Total Permits", value: stats.total || 0, icon: FileText, color: "text-blue-400" },
    { title: "Active Now", value: stats.active || 0, icon: CheckCircle2, color: "text-green-400" },
    { title: "Pending Approval", value: stats.pending || 0, icon: Clock, color: "text-yellow-400" },
    { title: "Expiring Soon", value: stats.expiringSoon || 0, icon: AlertCircle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} className="petrolord-card border-[var(--border-color)] bg-[var(--bg-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="petrolord-card border-[var(--border-color)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400 text-center py-8">
              No recent activity recorded.
            </div>
          </CardContent>
        </Card>
        
        <Card className="petrolord-card border-[var(--border-color)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400 text-center py-8">
              No compliance data available.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}