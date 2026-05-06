import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SafetyRiskScoreCard({ prediction }) {
  // Use mock or real prediction data
  const score = prediction?.predicted_value?.score || 0;
  const trend = prediction?.predicted_value?.trend || 'stable';

  // Determine styles based on score
  let colorClass = "text-green-500";
  let bgClass = "bg-green-500/10 border-green-500/30";
  let label = "Low Risk";
  
  if (score > 20) { colorClass = "text-yellow-500"; bgClass = "bg-yellow-500/10 border-yellow-500/30"; label = "Moderate Risk"; }
  if (score > 40) { colorClass = "text-orange-500"; bgClass = "bg-orange-500/10 border-orange-500/30"; label = "High Risk"; }
  if (score > 60) { colorClass = "text-red-500"; bgClass = "bg-red-500/10 border-red-500/30"; label = "Very High Risk"; }
  if (score > 80) { colorClass = "text-red-600"; bgClass = "bg-red-600/10 border-red-600/30"; label = "Critical Risk"; }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400';
  const trendText = trend === 'up' ? 'Worsening' : trend === 'down' ? 'Improving' : 'Stable';

  return (
    <Card className={cn("bg-[#1a1a2e] border-[#3a3a5a] relative overflow-hidden")}>
      <div className={cn("absolute inset-0 opacity-10 pointer-events-none", bgClass.replace('border-', 'bg-'))} />
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <h3 className="text-[#7a7a9a] uppercase text-xs font-bold tracking-wider mb-4">Organizational Risk Score</h3>
        
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[#252541]" />
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
              strokeDasharray={440} strokeDashoffset={440 - (440 * score) / 100}
              className={cn(colorClass, "transition-all duration-1000 ease-out")} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={cn("text-5xl font-extrabold", colorClass)}>{score}</span>
            <span className={cn("text-xs font-bold uppercase mt-1 px-2 py-0.5 rounded border", bgClass, colorClass)}>{label}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 bg-[#252541] px-4 py-2 rounded-full border border-[#3a3a5a]">
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <span className={cn("text-sm font-medium", trendColor)}>{trendText}</span>
          <span className="text-[#7a7a9a] text-xs ml-1">vs last week</span>
        </div>
      </CardContent>
    </Card>
  );
}