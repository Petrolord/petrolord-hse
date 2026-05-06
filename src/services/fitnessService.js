import { supabase } from '@/lib/customSupabaseClient';

export const fitnessService = {
  getTodayActivity: async (userId, orgId) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get Goal - Use maybeSingle() to handle case where no goal is set
    const { data: goalData } = await supabase
      .from('fitness_goals')
      .select('daily_step_goal')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .maybeSingle();

    // Get Today's Activity Sum
    const { data: activities } = await supabase
      .from('fitness_activities')
      .select('steps')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .eq('activity_date', today);

    const totalSteps = activities?.reduce((sum, item) => sum + (item.steps || 0), 0) || 0;

    return {
      steps: totalSteps,
      goal: goalData?.daily_step_goal || 8000
    };
  },

  logActivity: async (activityData) => {
    const { data, error } = await supabase
      .from('fitness_activities')
      .insert([activityData])
      .select();
    
    if (error) throw error;
    return data;
  },

  getActivityLog: async (userId, orgId) => {
    const { data, error } = await supabase
      .from('fitness_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};