import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetch organization by ID
 */
export const fetchOrganization = async (organizationId) => {
  try {
    // Fetch basic details
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) throw error;

    // Fetch stats
    const { count: memberCount } = await supabase
      .from('organization_users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const { count: assetCount } = await supabase
      .from('organization_assets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    return {
      ...org,
      member_count: memberCount || 0,
      asset_count: assetCount || 0,
      safety_score: 92 // Mock score or calculate from assets/incidents
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (organizationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

/**
 * Fetch organization members
 */
export const fetchOrganizationMembers = async (organizationId) => {
  try {
    // Join with users table to get email and metadata
    // This requires a foreign key from organization_users.user_id to public.users.id
    const { data, error } = await supabase
      .from('organization_users')
      .select(`
        id,
        role,
        created_at,
        user_id,
        user:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .eq('organization_id', organizationId);

    if (error) throw error;

    // Flatten the structure for easier consumption by UI
    return data.map(member => ({
      ...member,
      email: member.user?.email || 'Unknown',
      full_name: member.user?.raw_user_meta_data?.full_name || 'User',
      avatar_url: member.user?.raw_user_meta_data?.avatar_url
    }));
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

/**
 * Invite member to organization
 */
export const inviteMember = async (organizationId, email, role) => {
  try {
    // Use invitations table
    const { data, error } = await supabase
      .from('invitations')
      .insert([
        {
          org_id: organizationId,
          email,
          role,
          status: 'pending',
          token: crypto.randomUUID() // Simple token generation
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error inviting member:', error);
    throw error;
  }
};

/**
 * Remove member from organization
 */
export const removeMember = async (userId) => {
  try {
    const { error } = await supabase
      .from('organization_users')
      .delete()
      .eq('id', userId); // user_id in organization_users table pk

    if (error) throw error;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

/**
 * Fetch organization assets
 */
export const fetchOrganizationAssets = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('organization_assets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

/**
 * Add asset to organization
 */
export const addAsset = async (organizationId, assetData) => {
  try {
    const { data, error } = await supabase
      .from('organization_assets')
      .insert([
        {
          organization_id: organizationId,
          ...assetData,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
};

/**
 * Update asset
 */
export const updateAsset = async (assetId, updates) => {
  try {
    const { data, error } = await supabase
      .from('organization_assets')
      .update(updates)
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
};

/**
 * Delete asset
 */
export const deleteAsset = async (assetId) => {
  try {
    const { error } = await supabase
      .from('organization_assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

/**
 * Fetch asset safety data
 */
export const fetchAssetSafetyData = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('organization_assets')
      .select('safety_status')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const safetyData = {
      total: data?.length || 0,
      safe: data?.filter(a => a.safety_status === 'safe').length || 0,
      warning: data?.filter(a => a.safety_status === 'warning').length || 0,
      critical: data?.filter(a => a.safety_status === 'critical').length || 0,
    };

    safetyData.score = safetyData.total > 0 
      ? Math.round(((safetyData.safe / safetyData.total) * 100))
      : 0;

    return safetyData;
  } catch (error) {
    console.error('Error fetching safety data:', error);
    throw error;
  }
};