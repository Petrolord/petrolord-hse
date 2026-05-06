import { supabase } from '@/lib/customSupabaseClient';

/**
 * Enrich incidents with related data (Reporter, Site)
 */
export const enrichIncidents = async (incidents) => {
  if (!incidents || incidents.length === 0) return [];

  try {
    const userIds = [...new Set(incidents.map(i => i.created_by).filter(Boolean))];
    const siteIds = [...new Set(incidents.map(i => i.site_id).filter(Boolean))];

    // Fetch Users
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email').in('id', userIds);
      const { data: profiles } = await supabase.from('user_profiles').select('id, full_name').in('id', userIds);
      
      users?.forEach(u => { 
        const profile = profiles?.find(p => p.id === u.id);
        userMap[u.id] = { 
          id: u.id, 
          email: u.email, 
          raw_user_meta_data: { full_name: profile?.full_name || u.email } 
        }; 
      });
    }

    // Fetch Sites
    let siteMap = {};
    if (siteIds.length > 0) {
      const { data: sites } = await supabase.from('organization_sites').select('id, name').in('id', siteIds);
      sites?.forEach(s => { siteMap[s.id] = s; });
    }

    return incidents.map(incident => ({
      ...incident,
      reporter: userMap[incident.created_by] || { email: 'Unknown' },
      site: siteMap[incident.site_id] || { name: 'Unknown Site' },
      assignee: userMap[incident.created_by] // Default assignee logic if needed
    }));
  } catch (error) {
    console.error('Error enriching incidents:', error);
    return incidents;
  }
};

/**
 * Enrich actions with related data (Assignee, Creator, Report)
 */
export const enrichActions = async (actions) => {
  if (!actions || actions.length === 0) return [];

  try {
    const userIds = [...new Set([
      ...actions.map(a => a.assigned_to),
      ...actions.map(a => a.created_by),
      ...actions.map(a => a.approver_id)
    ].filter(Boolean))];
    
    const reportIds = [...new Set(actions.map(a => a.report_id).filter(Boolean))];

    // Fetch Users
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email').in('id', userIds);
      const { data: profiles } = await supabase.from('user_profiles').select('id, full_name').in('id', userIds);
      
      users?.forEach(u => { 
        const profile = profiles?.find(p => p.id === u.id);
        userMap[u.id] = { 
          id: u.id, 
          email: u.email, 
          raw_user_meta_data: { full_name: profile?.full_name || u.email } 
        }; 
      });
    }

    // Fetch Reports (Incidents)
    let reportMap = {};
    if (reportIds.length > 0) {
      const { data: reports } = await supabase.from('incidents').select('id, title, reference_code').in('id', reportIds);
      reports?.forEach(r => { reportMap[r.id] = r; });
    }

    return actions.map(action => ({
      ...action,
      assignee: userMap[action.assigned_to] || null,
      creator: userMap[action.created_by] || null,
      approver: userMap[action.approver_id] || null,
      report: reportMap[action.report_id] || null
    }));
  } catch (error) {
    console.error('Error enriching actions:', error);
    return actions;
  }
};