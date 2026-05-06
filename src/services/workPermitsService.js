import { supabase } from '../lib/customSupabaseClient';

/**
 * Fetch work permits
 */
export const fetchWorkPermits = async (organizationId) => {
  try {
    console.log('📋 [WORK PERMITS] Fetching work permits:', organizationId);

    if (!organizationId) {
      console.warn('⚠️ [WORK PERMITS] No organization ID provided');
      return [];
    }

    // Query work_permits WITHOUT joining to users table or accessing raw_user_meta_data
    const { data, error } = await supabase
      .from('work_permits')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [WORK PERMITS] Supabase error:', error);
      throw error;
    }

    console.log('✅ [WORK PERMITS] Work permits fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ [WORK PERMITS] Error fetching work permits:', error.message);
    return [];
  }
};

/**
 * Fetch work permits with enriched data
 */
export const fetchWorkPermitsEnriched = async (organizationId) => {
  try {
    console.log('📋 [WORK PERMITS] Fetching enriched work permits:', organizationId);

    if (!organizationId) {
      return [];
    }

    // Get work permits
    const permits = await fetchWorkPermits(organizationId);

    // Enrich with user data if needed
    if (permits && permits.length > 0) {
      const userIds = new Set();
      permits.forEach(p => {
        if (p.requested_by) userIds.add(p.requested_by);
        if (p.supervisor_id) userIds.add(p.supervisor_id);
      });

      if (userIds.size > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', Array.from(userIds));
          
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        const userMap = {};
        if (userData) userData.forEach(u => userMap[u.id] = { ...userMap[u.id], ...u });
        if (profileData) profileData.forEach(p => userMap[p.id] = { ...userMap[p.id], ...p });

        return permits.map(p => ({
          ...p,
          requester_email: userMap[p.requested_by]?.email || 'Unknown',
          requester_name: userMap[p.requested_by]?.full_name || 'Unknown',
          supervisor_email: userMap[p.supervisor_id]?.email || 'Unknown',
          supervisor_name: userMap[p.supervisor_id]?.full_name || 'Unknown',
        }));
      }
    }

    return permits;
  } catch (error) {
    console.error('❌ [WORK PERMITS] Error fetching enriched permits:', error.message);
    return [];
  }
};

/**
 * Create work permit
 */
export const createWorkPermit = async (organizationId, permitData) => {
  try {
    console.log('➕ [WORK PERMITS] Creating work permit:', permitData);

    const { data, error } = await supabase
      .from('work_permits')
      .insert([
        {
          organization_id: organizationId,
          ...permitData,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ [WORK PERMITS] Error creating permit:', error);
      throw error;
    }

    console.log('✅ [WORK PERMITS] Work permit created:', data);
    return data;
  } catch (error) {
    console.error('❌ [WORK PERMITS] Error:', error.message);
    throw error;
  }
};

/**
 * Update work permit
 */
export const updateWorkPermit = async (permitId, updates) => {
  try {
    console.log('✏️ [WORK PERMITS] Updating work permit:', permitId, updates);

    const { data, error } = await supabase
      .from('work_permits')
      .update(updates)
      .eq('id', permitId)
      .select()
      .single();

    if (error) {
      console.error('❌ [WORK PERMITS] Error updating permit:', error);
      throw error;
    }

    console.log('✅ [WORK PERMITS] Work permit updated:', data);
    return data;
  } catch (error) {
    console.error('❌ [WORK PERMITS] Error:', error.message);
    throw error;
  }
};