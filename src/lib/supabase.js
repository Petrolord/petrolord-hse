import { supabase } from '@/lib/customSupabaseClient';

// Re-export supabase for convenience in other modules
export { supabase };

// Helper to get the current user's organization ID
const getCurrentOrgId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: orgUser, error } = await supabase
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      // console.error('Error in getCurrentOrgId:', error); // Silent fail for cleaner logs
      return null;
    }
      
    return orgUser?.organization_id;
  } catch (err) {
    console.error('Unexpected error in getCurrentOrgId:', err);
    return null;
  }
};

export const hseQueries = {
  // --- Check Access Level (RPC) ---
  checkHSEAccess: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('check_hse_access', {
        p_user_id: userId
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error checking HSE access:', err);
      return { data: null, error: err };
    }
  },

  // --- Organization & User Management ---
  getCurrentUserContext: async (userId) => {
    try {
      // 1. Fetch organization_users entry with user_role
      const { data: orgUser, error: userError } = await supabase
        .from('organization_users')
        .select('*, user_role') 
        .eq('user_id', userId)
        .single();

      if (userError) {
        return { data: null, error: userError };
      }

      if (!orgUser) {
        return { data: null, error: { message: 'User not found in any organization' } };
      }

      // 2. Fetch organization details separately including subscription_tier
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*, subscription_tier')
        .eq('id', orgUser.organization_id)
        .single();

      if (orgError) {
        return { data: null, error: orgError };
      }

      // Combine manually
      orgUser.organization = org;
      // Map old role column to new user_role if user_role is missing/null
      if (!orgUser.user_role) orgUser.user_role = orgUser.role || 'staff_admin';

      return { data: orgUser, error: null };
    } catch (err) {
      console.error('Unexpected error in getCurrentUserContext:', err);
      return { data: null, error: err };
    }
  },

  // --- Feature Access Control & Limits ---
  getUsageMetrics: async () => {
    try {
      const orgId = await getCurrentOrgId();
      // If user has no organization (e.g. fresh super admin), just return null data gracefully
      if (!orgId) return { data: null };

      // Get metrics for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const dateStr = startOfMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('organization_id', orgId)
        .eq('period_start', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage metrics:', error);
      }
      
      return { data };
    } catch (err) {
      console.error('Usage metrics error:', err);
      return { data: null };
    }
  },

  incrementFeatureUsage: async (featureType) => {
    // featureType: 'email_count' | 'image_upload_count' | 'video_upload_count'
    try {
      const orgId = await getCurrentOrgId();
      if (!orgId) return { error: 'No org' };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const dateStr = startOfMonth.toISOString().split('T')[0];

      // Check if row exists
      let { data: metrics } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('organization_id', orgId)
        .eq('period_start', dateStr)
        .single();

      if (!metrics) {
        // Create new record for month
        const { data: newMetrics, error } = await supabase
          .from('usage_metrics')
          .insert([{ 
            organization_id: orgId, 
            period_start: dateStr,
            [featureType]: 1
          }])
          .select()
          .single();
          
        if (error) throw error;
        return { data: newMetrics };
      } else {
        // Increment
        const { data: updated, error } = await supabase
          .from('usage_metrics')
          .update({ [featureType]: metrics[featureType] + 1 })
          .eq('id', metrics.id)
          .select()
          .single();
          
        if (error) throw error;
        return { data: updated };
      }
    } catch (err) {
      console.error('Error incrementing usage:', err);
      return { error: err };
    }
  },

  logAction: async (action, details, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const orgId = await getCurrentOrgId();
      // If super admin without org, we can optionally skip logging or log with null org
      if (!orgId) {
        // console.warn('Logging action without org ID'); 
        // Proceeding might fail if org_id is required in DB schema, so let's skip for now if no org
        return; 
      }
      
      await supabase.from('audit_log').insert([{
          organization_id: orgId,
          user_id: user.id,
          action: action,
          details: details,
          metadata: metadata,
          created_at: new Date().toISOString()
        }]);
    } catch (e) { console.error(e) }
  }
};