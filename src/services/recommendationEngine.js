import { supabase } from '@/lib/customSupabaseClient';

export const recommendationEngine = {
  // Fetch Methods
  async getAlerts(organizationId) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching alerts:', error);
    return data || [];
  },

  async getRecommendations(organizationId) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('expected_risk_reduction', { ascending: false });

    if (error) console.error('Error fetching recommendations:', error);
    return data || [];
  },

  // Action Methods
  async acknowledgeAlert(alertId) {
    return await supabase
      .from('alerts')
      .update({ status: 'Acknowledged' })
      .eq('id', alertId);
  },

  async updateRecommendationStatus(id, status, notes = null) {
    const updates = { 
      status,
      updated_at: new Date().toISOString()
    };
    if (status === 'Accepted') updates.acceptance_date = new Date().toISOString();
    if (status === 'Completed') updates.completion_date = new Date().toISOString();
    if (notes) updates.rejection_reason = notes; // Using rejection_reason generic field for notes in this simple version

    return await supabase
      .from('recommendations')
      .update(updates)
      .eq('id', id);
  }
};