import { supabase } from '@/lib/customSupabaseClient';

export const securityRiskService = {
  async calculateRiskScore(userId, orgId) {
    try {
      // Mock calculation logic for demo purposes
      // In production, this would aggregate real data
      const { data } = await supabase
        .from('security_profiles')
        .select('security_risk_score')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();
        
      return data?.security_risk_score || Math.floor(Math.random() * 30) + 10; // Default low risk
    } catch (e) {
      return 25; // Fallback score
    }
  },

  async getOrgRiskScore(orgId) {
    return 42; // Mock org average
  }
};