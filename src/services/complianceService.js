import { supabase } from '@/lib/customSupabaseClient';

export const complianceService = {
  async getFrameworks(orgId) {
    const { data, error } = await supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('org_id', orgId);
    return data || [];
  },

  async createFramework(framework) {
    const { data, error } = await supabase
      .from('compliance_frameworks')
      .insert(framework)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRequirements(frameworkId) {
    const { data, error } = await supabase
      .from('compliance_requirements')
      .select('*')
      .eq('framework_id', frameworkId);
    return data || [];
  },

  async updateRequirementStatus(id, status) {
    const { data, error } = await supabase
      .from('compliance_requirements')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getStats(orgId) {
    // Simulate aggregation
    return {
      compliant: 145,
      partial: 23,
      nonCompliant: 5,
      upcomingAudits: 2
    };
  }
};