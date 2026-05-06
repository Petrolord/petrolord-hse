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

// Helper to get leaderboard
export const getLeaderboard = async (orgId, limit = 10) => {
  try {
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('user_points_summary')
      .select(`
        total_points,
        ranking,
        user:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .eq('organization_id', orgId)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Map to friendly format
    return data.map((entry, index) => ({
      id: entry.user_id || index,
      name: entry.user?.raw_user_meta_data?.full_name || entry.user?.email?.split('@')[0] || 'Unknown',
      points: entry.total_points,
      rank: index + 1,
      avatar: entry.user?.raw_user_meta_data?.avatar_url
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const gamificationService = {
  getUserScore,
  getLeaderboard
};

export default gamificationService;