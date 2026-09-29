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
      .from('organization_members')
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
      // No safety-score calculation exists yet; null renders as "No data yet".
      safety_score: null
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
 * Fetch organization members.
 * Reads organization_members, the membership table the rest of HSE reads
 * (HSEContext, quick reports, safety audits): it carries each member's
 * full_name and email. Avatars come from user_profiles when present, the
 * same lookup the leaderboard uses. The old read of organization_users with
 * an auth.users embed failed (the API cannot embed auth.users, and
 * organization_users is no longer a table), so the card showed
 * "No members yet".
 */
export const fetchOrganizationMembers = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('id, user_id, full_name, email, role, status, created_at, joined_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const rows = data || [];

    let avatars = {};
    const ids = [...new Set(rows.map((m) => m.user_id).filter(Boolean))];
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, avatar_url')
        .in('id', ids);
      avatars = Object.fromEntries((profiles || []).map((p) => [p.id, p.avatar_url]));
    }

    return rows.map((member) => ({
      ...member,
      email: member.email || 'Unknown',
      full_name: member.full_name || member.email?.split('@')[0] || 'User',
      avatar_url: (member.user_id && avatars[member.user_id]) || null,
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
export const removeMember = async (memberId, organizationId) => {
  try {
    // memberId is the organization_members row id the Members card lists.
    let query = supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);
    if (organizationId) query = query.eq('organization_id', organizationId);
    const { error } = await query;

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
      .select('id, name, safety_status, safety_notes, updated_at')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const safetyData = {
      total: data?.length || 0,
      safe: data?.filter(a => a.safety_status === 'safe').length || 0,
      warning: data?.filter(a => a.safety_status === 'warning').length || 0,
      critical: data?.filter(a => a.safety_status === 'critical').length || 0,
    };

    // Share of assets marked safe; null (shown as "No data yet") when there are no assets.
    safetyData.score = safetyData.total > 0 
      ? Math.round(((safetyData.safe / safetyData.total) * 100))
      : null;

    // Assets currently flagged warning or critical, most recently updated first.
    safetyData.flagged = (data || [])
      .filter(a => a.safety_status === 'warning' || a.safety_status === 'critical')
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .slice(0, 10);

    return safetyData;
  } catch (error) {
    console.error('Error fetching safety data:', error);
    throw error;
  }
};