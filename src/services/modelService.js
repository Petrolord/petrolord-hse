import { supabase } from '@/lib/customSupabaseClient';

// Handles Model Performance, Retraining, and Versions
export const modelService = {
  // --- VERSIONS ---
  async getModelVersions(organizationId) {
    const { data, error } = await supabase
      .from('model_versions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error); 
      return [];
    }
    
    // Return mock if empty for demo
    if (!data || data.length === 0) return [
      { id: '1', version_number: 'v2.1.0', status: 'active', accuracy_score: 87.5, precision_score: 84.2, recall_score: 89.1, f1_score: 86.6, training_date: new Date().toISOString(), dataset_size: 14500 },
      { id: '2', version_number: 'v2.0.5', status: 'archived', accuracy_score: 85.2, precision_score: 82.1, recall_score: 86.4, f1_score: 84.2, training_date: new Date(Date.now() - 86400000 * 14).toISOString(), dataset_size: 13200 },
      { id: '3', version_number: 'v1.9.0', status: 'archived', accuracy_score: 78.9, precision_score: 75.5, recall_score: 79.2, f1_score: 77.3, training_date: new Date(Date.now() - 86400000 * 45).toISOString(), dataset_size: 10500 },
    ];

    return data;
  },

  // --- RETRAINING ---
  async getRetrainingJobs(organizationId) {
    const { data } = await supabase
      .from('retraining_jobs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
      
    return data || [];
  },

  async triggerRetraining(organizationId) {
    // 1. Create a job entry
    const { data, error } = await supabase
      .from('retraining_jobs')
      .insert([{
        organization_id: organizationId,
        status: 'running',
        triggered_by: 'user',
        start_time: new Date().toISOString(),
        logs: [{ timestamp: new Date().toISOString(), message: 'Retraining initiated by user.' }]
      }])
      .select();

    if (error) throw error;
    
    // 2. Simulate processing (In real app, this calls an Edge Function)
    setTimeout(async () => {
      await this.completeRetraining(data[0].id, organizationId);
    }, 5000); // 5 sec mock delay

    return data[0];
  },

  async completeRetraining(jobId, organizationId) {
    // Generate a new model version
    const newVersionNum = `v2.1.${Math.floor(Math.random() * 9) + 1}`;
    const acc = (87 + Math.random() * 5).toFixed(1);
    
    const { data: model } = await supabase
      .from('model_versions')
      .insert([{
        organization_id: organizationId,
        version_number: newVersionNum,
        status: 'active',
        accuracy_score: acc,
        precision_score: (Number(acc) - 2).toFixed(1),
        recall_score: (Number(acc) + 1).toFixed(1),
        f1_score: (Number(acc) - 0.5).toFixed(1),
        training_date: new Date().toISOString(),
        dataset_size: 15000 + Math.floor(Math.random() * 500)
      }])
      .select();

    // Archive old active models
    await supabase
      .from('model_versions')
      .update({ status: 'archived' })
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .neq('id', model[0].id);

    // Update job status
    await supabase
      .from('retraining_jobs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        new_model_version_id: model[0].id,
        logs: [
          { timestamp: new Date().toISOString(), message: 'Data ingestion complete.' },
          { timestamp: new Date().toISOString(), message: 'Model training finished successfully.' },
          { timestamp: new Date().toISOString(), message: `New version ${newVersionNum} deployed.` }
        ]
      })
      .eq('id', jobId);
  }
};