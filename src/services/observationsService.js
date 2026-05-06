import { supabase } from '@/lib/customSupabaseClient';

export const observationsService = {
  /**
   * Fetch observations with advanced filtering
   */
  async getObservations(orgId, filters = {}) {
    try {
      if (!orgId) return [];

      // 1. Fetch raw incidents data
      let query = supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', orgId)
        .in('report_type', ['Safety Observation', 'Hazard Identification', 'Behavioral', 'Unsafe Act', 'Unsafe Condition']);

      // Text Search
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,reference_code.ilike.%${filters.search}%`);
      }

      // Date Range
      if (filters.dateRange?.from) {
        query = query.gte('incident_date', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('incident_date', filters.dateRange.to.toISOString());
      }

      // Exact Match Filters
      if (filters.site_id && filters.site_id !== 'all') {
        query = query.eq('site_id', filters.site_id);
      }
      
      // Execute query
      const { data: incidentsData, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.warn("Error fetching observations:", error);
        return []; 
      }

      if (!incidentsData || incidentsData.length === 0) return [];

      // 2. Manually fetch related data (Users and Sites)
      // Collect unique IDs
      const userIds = [...new Set(incidentsData.map(item => item.created_by).filter(Boolean))];
      const siteIds = [...new Set(incidentsData.map(item => item.site_id).filter(Boolean))];

      // Fetch Users
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data')
          .in('id', userIds);
        
        if (usersData) {
          usersData.forEach(u => { usersMap[u.id] = u; });
        }
      }

      // Fetch Sites
      let sitesMap = {};
      if (siteIds.length > 0) {
        const { data: sitesData } = await supabase
          .from('organization_sites')
          .select('id, name')
          .in('id', siteIds);
          
        if (sitesData) {
          sitesData.forEach(s => { sitesMap[s.id] = s; });
        }
      }

      // 3. Enrich Data
      let filteredData = incidentsData.map(obs => ({
        ...obs,
        reporter: usersMap[obs.created_by] || { email: 'Unknown User' },
        site: sitesMap[obs.site_id] || { name: 'Unknown Site' },
        // Enrich with mock coordinates for map if missing (for demo visualization)
        lat: obs.lat || (4.77 + (Math.random() * 0.1 - 0.05)), 
        lng: obs.lon || (7.00 + (Math.random() * 0.1 - 0.05)),
        location_detail: obs.location_detail || 'Main Site'
      }));

      // Client-side filtering for multi-selects (status/severity)
      if (filters.status && filters.status.length > 0) {
        filteredData = filteredData.filter(item => filters.status.includes(item.status));
      }

      if (filters.severity && filters.severity.length > 0) {
        filteredData = filteredData.filter(item => filters.severity.includes(item.severity));
      }
      
      return filteredData;
    } catch (err) {
      console.error("Unexpected error in getObservations:", err);
      return [];
    }
  },

  /**
   * Update status
   */
  async updateStatus(id, newStatus) {
    const { data, error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Add a comment
   */
  async addComment(reportId, userId, content) {
    // 1. Fetch current record
    const { data: report, error: fetchError } = await supabase
      .from('incidents')
      .select('actions') 
      .eq('id', reportId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentActions = report?.actions || {};
    const currentComments = currentActions.comments || [];
    
    const newComment = {
      id: Date.now().toString(),
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('incidents')
      .update({
        actions: {
          ...currentActions,
          comments: [...currentComments, newComment]
        }
      })
      .eq('id', reportId);

    if (updateError) throw updateError;
    return newComment;
  }
};