import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetch organization users
 */
const fetchOrganizationUsers = async (organizationId) => {
  try {
    if (!organizationId) return [];

    const { data, error } = await supabase
      .from('organization_users')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Fetch organization users with enriched data (Manual Join)
 * Returns structure compatible with previous join queries:
 * { ...orgUser, user: { id, email, raw_user_meta_data: { full_name, ... } } }
 */
const fetchOrganizationUsersEnriched = async (organizationId) => {
  try {
    if (!organizationId) return [];

    // 1. Get organization users
    const orgUsers = await fetchOrganizationUsers(organizationId);
    if (!orgUsers.length) return [];

    // 2. Get User IDs
    const userIds = orgUsers.map(u => u.user_id).filter(Boolean);
    if (!userIds.length) return orgUsers;

    // 3. Fetch Public User Data
    const { data: publicUsers } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    // 4. Fetch User Profiles (for names)
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    // 5. Map Data
    const userMap = {};
    publicUsers?.forEach(u => { userMap[u.id] = { ...userMap[u.id], ...u }; });
    userProfiles?.forEach(p => { userMap[p.id] = { ...userMap[p.id], ...p }; });

    // 6. Merge and Return
    return orgUsers.map(ou => {
      const details = userMap[ou.user_id] || {};
      return {
        ...ou,
        user: {
          id: ou.user_id,
          email: details.email || 'No Email',
          raw_user_meta_data: {
            full_name: details.full_name || details.email?.split('@')[0] || 'Unknown User',
            avatar_url: details.avatar_url
          }
        }
      };
    });
  } catch (error) {
    console.error('Error fetching enriched users:', error);
    return [];
  }
};

export const organizationUsersService = {
  fetchOrganizationUsers,
  fetchOrganizationUsersEnriched
};