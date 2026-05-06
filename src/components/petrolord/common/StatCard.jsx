import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, unit, icon: Icon, color, trend }) {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a] hover:border-blue-500/30 transition-all">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </div>
          {trend && <p className={`text-xs mt-1 ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>{trend > 0 ? '+' : ''}{trend}% vs last month</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-opacity-10 ${color ? color.replace('text-', 'bg-') : 'bg-gray-500'}`}>
          {Icon && <Icon className={`h-5 w-5 ${color}`} />}
        </div>
      </CardContent>
    </Card>
  );
}