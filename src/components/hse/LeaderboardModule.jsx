import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { Loader2 } from 'lucide-react';
import LeaderboardStats from './leaderboard/LeaderboardStats';
import LeaderboardTable from './leaderboard/LeaderboardTable';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/customSupabaseClient';

// Design family (batch 2C): the Leaderboard renders inside the signed-in
// scope (src/design/rollout/w2c.js) on the theme roles.
export default function LeaderboardModule() {
  const { currentOrganization, currentUser } = useHSE();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all_time');

  const fetchData = async () => {
    if (!currentOrganization || !currentUser) return;
    setLoading(true);
    try {
      const [data, stats] = await Promise.all([
        gamificationService.getLeaderboard(currentOrganization.id, period),
        gamificationService.getUserStats(currentUser.id, currentOrganization.id)
      ]);
      setLeaderboardData(data);
      setMyStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, currentUser, period]);

  // Real-time subscription
  useEffect(() => {
    if (!currentOrganization) return;

    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for any change to scores
          schema: 'public',
          table: 'leaderboard_scores',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        () => {
          // Refresh on update
          fetchData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrganization, period]);

  if (!currentOrganization) return null;

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-pl-border bg-pl-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Leaderboard</h1>
            <p className="text-sm text-pl-muted">Track performance and earn recognition.</p>
          </div>
          <Tabs value={period} onValueChange={setPeriod} className="w-full md:w-auto">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all_time" className="flex-1 md:flex-none">All Time</TabsTrigger>
              <TabsTrigger value="this_month" className="flex-1 md:flex-none">This Month</TabsTrigger>
              <TabsTrigger value="this_week" className="flex-1 md:flex-none">This Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {myStats && <LeaderboardStats stats={myStats} />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-pl-muted">
            <Loader2 className="h-8 w-8 animate-spin text-pl-muted mr-2" aria-hidden="true" /> Loading ranking...
          </div>
        ) : (
          <LeaderboardTable 
            data={leaderboardData} 
            currentUserId={currentUser.id} 
          />
        )}
      </div>
    </div>
  );
}
