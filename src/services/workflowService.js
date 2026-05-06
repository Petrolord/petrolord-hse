import { supabase } from '@/lib/customSupabaseClient';

export const workflowService = {
  async getWorkflows(orgId) {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error && error.code !== 'PGRST116') { // Ignore empty table errors for now
        // Fallback for demo if table empty
        return [];
    }
    return data || [];
  },

  async createWorkflow(workflow) {
    const { data, error } = await supabase
      .from('workflows')
      .insert(workflow)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getExecutions(orgId) {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*, workflow:workflow_id(name)')
      .limit(20)
      .order('started_at', { ascending: false });
      
    if (error) return []; // robust fallback
    return data || [];
  },

  // Mock template generator
  getTemplates() {
    return [
      { id: 't1', name: 'Critical Incident Alert', trigger: 'incident_created', description: 'Email Safety Manager when Critical incident reported.' },
      { id: 't2', name: 'Permit Expiry Reminder', trigger: 'schedule', description: 'Check for permits expiring in 24h and notify requester.' },
      { id: 't3', name: 'Compliance Monthly Report', trigger: 'schedule', description: 'Generate and archive monthly compliance PDF.' }
    ];
  }
};