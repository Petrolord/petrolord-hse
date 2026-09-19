import { supabase } from '@/lib/customSupabaseClient';

export const securityRiskService = {
  // Returns the security risk score stored on the user's security profile, or
  // null when none is recorded. No score is generated or defaulted here.
  async calculateRiskScore(userId, orgId) {
    try {
      const { data, error } = await supabase
        .from('security_profiles')
        .select('security_risk_score')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (error) throw error;
      const score = data?.security_risk_score;
      return score === null || score === undefined ? null : Number(score);
    } catch (e) {
      console.warn('Error fetching security risk score:', e);
      return null;
    }
  },
};
