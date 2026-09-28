import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { Flame } from 'lucide-react';

// Design system (wave 0 pilot): the dashboard renders inside the signed-in
// scope only, so this card uses the theme roles directly.
export default function SafetyScore() {
  const { currentUser, currentOrganization } = useHSE();
  const [stats, setStats] = useState({ total_points: 0, current_streak: 0 });

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

  return (
    <div className="h-full rounded-xl border border-pl-border bg-pl-surface p-5 shadow-pl-sm">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="text-pl-muted text-xs font-semibold uppercase tracking-wider mb-1">Safety Score</p>
          <div className="flex items-baseline gap-1">
            <h3 className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{(stats?.total_points || 0).toLocaleString()}</h3>
            <span className="text-xs text-pl-muted">pts</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 rounded-full border border-pl-accent/40 bg-pl-accent/10 px-2 py-1 text-pl-accent-text">
            <Flame className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{stats?.current_streak || 0} Day Streak</span>
          </div>
        </div>
      </div>

    </div>
  );
}