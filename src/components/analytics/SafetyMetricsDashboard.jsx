import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, trend, trendDir, status }) => (
  <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
    <CardContent className="p-4">
      <p className="text-[#7a7a9a] text-xs font-bold uppercase">{title}</p>
      <div className="flex justify-between items-end mt-2">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <div className={`flex items-center text-xs px-2 py-1 rounded ${
          status === 'good' ? 'bg-green-500/20 text-green-400' : 
          status === 'bad' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {trendDir === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
          {trendDir === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
          {trendDir === 'flat' && <Minus className="h-3 w-3 mr-1" />}
          {trend}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function SafetyMetricsDashboard() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <MetricCard title="Total Risk Score" value="52" trend="-12%" trendDir="down" status="good" />
      <MetricCard title="Predicted Incidents" value="3" trend="+1" trendDir="up" status="bad" />
      <MetricCard title="Compliance" value="94%" trend="+5%" trendDir="up" status="good" />
      <MetricCard title="Open Alerts" value="8" trend="0" trendDir="flat" status="warning" />
    </div>
  );
}