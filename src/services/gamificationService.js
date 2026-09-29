import { supabase } from '@/lib/customSupabaseClient';

// Helper to get user score
export const getUserScore = async (userId) => {
  try {
    if (!userId) return { total_points: 0, current_streak: 0, ranking: 0 };
    
    const { data, error } = await supabase
      .from('user_points_summary')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data || { total_points: 0, current_streak: 0, ranking: 0 };
  } catch (error) {
    console.warn('Error fetching user score:', error);
    // Return default structure to prevent UI crashes
    return { total_points: 0, current_streak: 0, ranking: 0 };
  }
};

// Helper to get leaderboard.
// Reads user_points_summary for the organisation, highest points first, then
// looks the names up in user_profiles (and users for an e-mail fallback).
// user_points_summary has no `ranking` column and its user_id points at
// auth.users, which the API cannot embed, so the old single select with
// `ranking` and `user:user_id(...)` always failed and returned [] (batch 4B).
// Read only. Each row: { id, user_id, name, email, avatar, points,
// total_points, current_streak, rank }.
// Names for a set of user ids: user_profiles (name, avatar) with users as the
// e-mail and metadata fallback. Read only.
const lookupPeople = async (ids) => {
  const people = {};
  if (!ids.length) return people;
  const [{ data: profiles }, { data: users }] = await Promise.all([
    supabase.from('user_profiles').select('id, full_name, avatar_url').in('id', ids),
    supabase.from('users').select('id, email, raw_user_meta_data').in('id', ids),
  ]);
  (users || []).forEach((u) => { people[u.id] = { ...people[u.id], email: u.email, meta: u.raw_user_meta_data || {} }; });
  (profiles || []).forEach((p) => { people[p.id] = { ...people[p.id], full_name: p.full_name, avatar_url: p.avatar_url }; });
  return people;
};

const personFields = (who = {}) => {
  const meta = who.meta || {};
  return {
    name: who.full_name || meta.full_name || who.email?.split('@')[0] || 'Unknown',
    email: who.email || null,
    avatar: who.avatar_url || meta.avatar_url,
  };
};

export const getLeaderboard = async (orgId, limit = 10) => {
  try {
    if (!orgId) return [];
    const size = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const { data, error } = await supabase
      .from('user_points_summary')
      .select('user_id, total_points, current_streak')
      .eq('organization_id', orgId)
      .order('total_points', { ascending: false })
      .limit(size);

    if (error) throw error;
    const rows = data || [];
    const ids = rows.map((r) => r.user_id).filter(Boolean);

    const people = await lookupPeople(ids);

    return rows.map((entry, index) => {
      return {
        id: entry.user_id || index,
        user_id: entry.user_id,
        ...personFields(people[entry.user_id]),
        points: entry.total_points ?? 0,
        total_points: entry.total_points ?? 0,
        current_streak: entry.current_streak ?? 0,
        rank: index + 1,
      };
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Where a period starts, in the viewer's local time: this_week from Monday
// 00:00, this_month from the 1st at 00:00. Anything else has no start.
export const periodStart = (period, now = new Date()) => {
  if (period === 'this_month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'this_week') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
  return null;
};

// The ledger table is missing until migration 20260929120000 is applied.
const isMissingTable = (error) => {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  return /hse_points_events/.test(error.message || '') && /(does not exist|could not find|schema cache)/i.test(error.message || '');
};

// Ranking for a dated period, from the points ledger (hse_points_events,
// one row per award, written only by the database). Read only.
// Returns { available, rows }: available is false when the ledger is not
// there yet, so the page can say so; rows are ranked like getLeaderboard's,
// plus period_points and reports (awards in the period).
export const getPeriodLeaderboard = async (orgId, period, now = new Date()) => {
  const start = periodStart(period, now);
  if (!orgId || !start) return { available: true, rows: [] };
  try {
    const { data, error } = await supabase
      .from('hse_points_events')
      .select('user_id, points, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) {
      if (isMissingTable(error)) return { available: false, rows: [] };
      throw error;
    }
    const byUser = new Map();
    (data || []).forEach((e) => {
      if (!e.user_id) return;
      const cur = byUser.get(e.user_id) || { points: 0, reports: 0 };
      cur.points += Number(e.points) || 0;
      cur.reports += 1;
      byUser.set(e.user_id, cur);
    });
    const ranked = [...byUser.entries()]
      .sort((a, b) => b[1].points - a[1].points || b[1].reports - a[1].reports);
    const people = await lookupPeople(ranked.map(([id]) => id));
    return {
      available: true,
      rows: ranked.map(([userId, agg], index) => ({
        id: userId,
        user_id: userId,
        ...personFields(people[userId]),
        points: agg.points,
        period_points: agg.points,
        reports: agg.reports,
        rank: index + 1,
      })),
    };
  } catch (error) {
    console.error('Error fetching period leaderboard:', error);
    return { available: true, rows: [] };
  }
};

// The current user's own report figures for the Leaderboard tiles: the
// average quality score of their submitted reports, and the reports and
// points they submitted this calendar month. A read-only query on
// quick_reports (the table stores each report's quality_score and
// leaderboard_points); the reporter can always read their own reports.
export const getMyReportStats = async (userId, orgId, now = new Date()) => {
  const empty = { qualityScore: null, pointsThisMonth: null, reportsThisMonth: null };
  try {
    if (!userId || !orgId) return empty;
    const { data, error } = await supabase
      .from('quick_reports')
      .select('quality_score, leaderboard_points, created_at, status')
      .eq('created_by_user_id', userId)
      .eq('organization_id', orgId)
      .neq('status', 'draft');
    if (error) throw error;
    const rows = data || [];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = rows.filter((r) => r.created_at && new Date(r.created_at) >= monthStart);
    const scored = rows.map((r) => Number(r.quality_score)).filter((v) => Number.isFinite(v) && v > 0);
    return {
      qualityScore: scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null,
      pointsThisMonth: thisMonth.reduce((a, r) => a + (Number(r.leaderboard_points) || 0), 0),
      reportsThisMonth: thisMonth.length,
    };
  } catch (error) {
    console.warn('Error fetching report stats:', error);
    return empty;
  }
};

// All badge definitions (badge catalog shown on the dashboard).
export const getAllBadges = async () => {
  try {
    const { data, error } = await supabase
      .from('badge_definitions')
      .select('id, name, description, icon, requirement_type, requirement_count, rarity')
      .order('requirement_count', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Error fetching badge definitions:', error);
    return [];
  }
};

// Badges this user has unlocked in this organization.
export const getUserBadges = async (userId, orgId) => {
  try {
    if (!userId) return [];
    let query = supabase
      .from('user_badges')
      .select('badge_id, unlocked_at')
      .eq('user_id', userId);
    if (orgId) query = query.eq('organization_id', orgId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Error fetching user badges:', error);
    return [];
  }
};

export const gamificationService = {
  getUserScore,
  getLeaderboard,
  getPeriodLeaderboard,
  getMyReportStats,
  getAllBadges,
  getUserBadges
};

export default gamificationService;