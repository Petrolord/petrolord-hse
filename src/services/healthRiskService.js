import { supabase } from '@/lib/customSupabaseClient';

export const healthRiskService = {
  /**
   * Calculate Health Risk Score (0-100)
   * 0 = Perfect Health, 100 = Critical Risk
   */
  calculateRiskScore: async (userId, orgId) => {
    try {
      // 1. Fetch Profile Factors (Age, Conditions)
      // Use maybeSingle() to avoid error if profile doesn't exist
      const { data: profile } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .maybeSingle();

      // 2. Fetch Recent Exposures
      const { count: exposureCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('created_by', userId) 
        .eq('hazard_category', 'Health')
        .gte('incident_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

      // 3. Fetch Absence Rate
      const { data: absences } = await supabase
        .from('absence_records')
        .select('duration_days')
        .eq('user_id', userId)
        .eq('health_related', true)
        .gte('absence_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      const totalAbsenceDays = absences?.reduce((sum, r) => sum + r.duration_days, 0) || 0;

      // 4. Calculate Score
      let score = 10; // Base score

      // Condition Factor
      if (profile?.medical_conditions?.length > 0) score += (profile.medical_conditions.length * 5);
      
      // Exposure Factor (High impact)
      if (exposureCount) score += (exposureCount * 10);

      // Absence Factor
      if (totalAbsenceDays > 2) score += (totalAbsenceDays * 2);

      // Cap at 100
      return Math.min(score, 100);

    } catch (error) {
      console.error("Error calculating risk:", error);
      return 0;
    }
  },

  updateHealthProfile: async (userId, orgId, updates) => {
    const { data, error } = await supabase
      .from('health_profiles')
      .upsert({ user_id: userId, organization_id: orgId, ...updates })
      .select();
    
    if (error) throw error;
    return data;
  }
};