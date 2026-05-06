import { supabase } from '@/lib/customSupabaseClient';

export const recommendationEngine = {
  // Generate mock data if none exists (for demo purposes)
  async initializeDemoData(organizationId) {
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1);

    if (!existingAlerts?.length) {
      await this.generateDemoAlerts(organizationId);
      await this.generateDemoRecommendations(organizationId);
    }
  },

  async generateDemoAlerts(organizationId) {
    const alerts = [
      {
        organization_id: organizationId,
        alert_type: 'CRITICAL',
        title: 'Chemical Storage Ventilation Failure Risk',
        description: 'Sensor data indicates declining air quality. 87% probability of threshold breach in 24h.',
        source: 'IoT Sensor Network',
        recommended_action: 'Inspect ventilation fans immediately',
        expected_impact: 'Prevents potential gas leak incident',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        organization_id: organizationId,
        alert_type: 'HIGH',
        title: 'Overdue Hazard Assessment: Warehouse B',
        description: 'Quarterly assessment is 14 days overdue. Risk level elevated due to recent near-misses.',
        source: 'Compliance Tracker',
        recommended_action: 'Conduct hazard assessment',
        expected_impact: 'Ensures regulatory compliance',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      },
      {
        organization_id: organizationId,
        alert_type: 'MEDIUM',
        title: 'Training Gap Detected',
        description: 'New safety protocol "Working at Heights v2" has 45% completion rate.',
        source: 'Training Module',
        recommended_action: 'Schedule team training session',
        expected_impact: 'Reduces fall risk by predicted 15%',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ];
    await supabase.from('alerts').insert(alerts);
  },

  async generateDemoRecommendations(organizationId) {
    const recs = [
      {
        organization_id: organizationId,
        recommendation_type: 'PREVENTIVE',
        title: 'Install Anti-Slip Mats in Loading Bay',
        description: 'AI model predicts 3 slip/fall incidents in next 30 days based on weather forecast (rain) and historical correlation.',
        affected_department: 'Logistics',
        affected_area: 'Loading Bay 2',
        predicted_incident_type: 'Slip/Trip/Fall',
        expected_risk_reduction: 42,
        implementation_effort: 'Low',
        timeline: '1 week',
        status: 'Generated',
        success_metrics: 'Zero slip incidents in rainy conditions'
      },
      {
        organization_id: organizationId,
        recommendation_type: 'CORRECTIVE',
        title: 'Update Forklift Maintenance Schedule',
        description: 'Predictive maintenance model detects irregular vibration patterns in Forklift fleet.',
        affected_department: 'Warehouse',
        affected_area: 'Main Floor',
        predicted_incident_type: 'Equipment Failure',
        expected_risk_reduction: 28,
        implementation_effort: 'Medium',
        timeline: 'Immediate',
        status: 'Generated',
        success_metrics: 'Vibration metrics return to baseline'
      },
      {
        organization_id: organizationId,
        recommendation_type: 'TRAINING',
        title: 'Refresher: Chemical Handling',
        description: 'Recent observations show minor deviations from protocol in mixing area.',
        affected_department: 'Production',
        affected_area: 'Mixing Lab',
        predicted_incident_type: 'Chemical Spill',
        expected_risk_reduction: 15,
        implementation_effort: 'Low',
        timeline: '1 month',
        status: 'Generated',
        success_metrics: 'Observation score > 95%'
      }
    ];
    await supabase.from('recommendations').insert(recs);
  },

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