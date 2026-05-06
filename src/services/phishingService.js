import { supabase } from '@/lib/customSupabaseClient';

export const phishingService = {
  async getLatestSimulationResults(orgId) {
    const { data } = await supabase
      .from('phishing_simulations')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },

  async getUserPhishingStats(userId) {
    const { data } = await supabase
      .from('phishing_results')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }
};