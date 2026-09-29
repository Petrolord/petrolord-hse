import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { Loader2 } from 'lucide-react';
import LeaderboardStats from './leaderboard/LeaderboardStats';
import LeaderboardTable from './leaderboard/LeaderboardTable';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Design family (batch 2C): the Leaderboard renders inside the signed-in
// scope (src/design/SignedInScope.jsx) on the theme roles.
// How many ranked members the page reads: enough to find the current user's
// rank in any HSE organisation.
export const LEADERBOARD_SIZE = 200;

// All Time ranks the running totals (user_points_summary). This Month and
// This Week rank the dated points ledger (hse_points_events), which the
// database writes when a report is submitted. Until the ledger is switched on
// (migration 20260929120000) the period tabs show this note.
export const PERIOD_NOTE = 'Rankings for this period start once the points history is switched on. All Time shows the running totals.';

// A leaderboard row (gamificationService.getLeaderboard) in the shape the
// rankings table reads. Reports and quality per person are not in the
// totals table, so they read n/a.
export const toTableRow = (row) => ({
  user_id: row.user_id,
  rank: row.rank,
  total_points: row.total_points ?? row.points ?? 0,
  period_points: row.period_points ?? 0,
  total_reports: row.reports ?? null,
  quality_score: null,
  user: { email: row.email || undefined, raw_user_meta_data: { full_name: row.name, avatar_url: row.avatar } },
});

export default function LeaderboardModule() {
  const { currentOrganization, currentUser } = useHSE();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all_time');
  const [periodRows, setPeriodRows] = useState([]);
  const [periodAvailable, setPeriodAvailable] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization || !currentUser) return;
    setLoading(true);
    try {
      const [ranks, score, mine] = await Promise.all([
        gamificationService.getLeaderboard(currentOrganization.id, LEADERBOARD_SIZE),
        gamificationService.getUserScore(currentUser.id, currentOrganization.id),
        gamificationService.getMyReportStats(currentUser.id, currentOrganization.id),
      ]);
      const rows = (ranks || []).map(toTableRow);
      const me = rows.find((r) => r.user_id === currentUser.id);
      setLeaderboardData(rows);
      setMyStats({
        rank: me ? me.rank : null,
        totalUsers: rows.length || null,
        totalPoints: score?.total_points ?? null,
        qualityScore: mine?.qualityScore ?? null,
        pointsThisMonth: mine?.pointsThisMonth ?? null,
        reportsThisMonth: mine?.reportsThisMonth ?? null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, currentUser]);

  // This Month and This Week read the dated ledger.
  useEffect(() => {
    if (!currentOrganization || period === 'all_time') return undefined;
    let live = true;
    setPeriodLoading(true);
    gamificationService.getPeriodLeaderboard(currentOrganization.id, period)
      .then((res) => {
        if (!live) return;
        setPeriodAvailable(res?.available !== false);
        setPeriodRows((res?.rows || []).map(toTableRow));
      })
      .catch(() => { if (live) setPeriodRows([]); })
      .finally(() => { if (live) setPeriodLoading(false); });
    return () => { live = false; };
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
        {loading || (period !== 'all_time' && periodLoading) ? (
          <div className="flex items-center justify-center h-full text-pl-muted">
            <Loader2 className="h-8 w-8 animate-spin text-pl-muted mr-2" aria-hidden="true" /> Loading ranking...
          </div>
        ) : period !== 'all_time' && !periodAvailable ? (
          <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-lg p-8 text-center text-sm text-pl-muted" role="status">
            {PERIOD_NOTE}
          </div>
        ) : (
          <LeaderboardTable
            data={period === 'all_time' ? leaderboardData : periodRows}
            currentUserId={currentUser.id}
          />
        )}
      </div>
    </div>
  );
}
