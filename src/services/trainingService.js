import { supabase } from '@/lib/customSupabaseClient';

export const trainingService = {
  async getUserTraining(userId) {
    const { data } = await supabase
      .from('security_training')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  },

  async getComplianceStats(orgId) {
    // Mock aggregation
    return {
      completed: 85,
      inProgress: 10,
      notStarted: 5
    };
  }
};