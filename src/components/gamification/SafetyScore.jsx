import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { Trophy, Flame, Star } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function SafetyScore() {
  const { currentUser, currentOrganization } = useHSE();
  const [stats, setStats] = useState({ total_points: 0, current_streak: 0 });
  const [nextBadge, setNextBadge] = useState({ name: 'Safety Scout', target: 500 }); // Mock target logic

  useEffect(() => {
    const loadStats = async () => {
      if (currentUser && currentOrganization) {
        const data = await gamificationService.getUserScore(currentUser.id, currentOrganization.id);
        setStats(data);
      }
    };
    loadStats();
    
    // Listen for custom event 'points-updated' if we implement global event bus later
    const interval = setInterval(loadStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [currentUser, currentOrganization]);

  // Mock progress calculation
  const progress = (stats.total_points % 500) / 500 * 100;

  return (
    <div className="bg-gradient-to-br from-[#252541] to-[#1f1f35] border border-[#3a3a5a] rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[#7a7a9a] text-xs font-bold uppercase tracking-wider mb-1">Safety Score</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-extrabold text-white">{stats.total_points.toLocaleString()}</h3>
            <span className="text-xs text-[#FFC107]">pts</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 text-orange-400">
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold">{stats.current_streak} Day Streak</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#b0b0c0]">Next Reward: <span className="text-white font-medium">{nextBadge.name}</span></span>
          <span className="text-[#7a7a9a]">{Math.floor(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-[#1a1a2e]" indicatorClassName="bg-gradient-to-r from-yellow-500 to-orange-500" />
      </div>
    </div>
  );
}