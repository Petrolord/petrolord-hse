import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PermitDashboard({ stats }) {
  const cards = [
    { title: "Total Permits", value: stats.total || 0, icon: FileText },
    { title: "Active Now", value: stats.active || 0, icon: CheckCircle2 },
    { title: "Pending Approval", value: stats.pending || 0, icon: Clock },
    { title: "Expiring Soon", value: stats.expiringSoon || 0, icon: AlertCircle, attention: (stats.expiringSoon || 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-pl-muted">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 shrink-0 ${card.attention ? 'text-pl-danger-text' : 'text-pl-muted'}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-pl-text">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-pl-muted text-center py-8">
              No recent activity recorded.
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-pl-text">Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-pl-muted text-center py-8">
              No compliance data available.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}