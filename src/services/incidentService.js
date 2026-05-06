import { supabase } from '@/lib/customSupabaseClient';

export const incidentService = {
  async getSecurityIncidents(orgId) {
    const { data, error } = await supabase
      .from('security_incidents')
      .select('*, assignee:assigned_to(email, raw_user_meta_data)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
    return data || [];
  },

  async createIncident(payload) {
    const { data, error } = await supabase
      .from('security_incidents')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};