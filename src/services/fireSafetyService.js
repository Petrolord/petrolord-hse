import { supabase } from '@/lib/customSupabaseClient';

export const fireSafetyService = {
  // Dashboard Stats
  async getDashboardStats(orgId) {
    const [risks, equipment, drills, incidents, compliance] = await Promise.all([
      supabase.from('fire_safety_risks').select('risk_score').eq('org_id', orgId),
      supabase.from('fire_equipment_inventory').select('status').eq('org_id', orgId),
      supabase.from('fire_drills').select('*').eq('org_id', orgId),
      supabase.from('fire_incidents').select('*').eq('org_id', orgId),
      supabase.from('fire_safety_compliance').select('is_compliant').eq('org_id', orgId)
    ]);

    const totalEquipment = equipment.data?.length || 0;
    const operationalEq = equipment.data?.filter(e => e.status === 'Operational').length || 0;
    const maintenanceScore = totalEquipment ? Math.round((operationalEq / totalEquipment) * 100) : 100;

    const totalComplianceItems = compliance.data?.length || 0;
    const compliantItems = compliance.data?.filter(c => c.is_compliant).length || 0;
    const complianceScore = totalComplianceItems ? Math.round((compliantItems / totalComplianceItems) * 100) : 0;

    // Calculate Risk Score (Inverse of average risk, simplified)
    const avgRisk = risks.data?.reduce((acc, r) => acc + (r.risk_score || 0), 0) / (risks.data?.length || 1);
    const riskScore = Math.max(0, 100 - (avgRisk * 4)); // Scale 25 max risk to 100

    return {
      riskScore: Math.round(riskScore),
      complianceScore,
      maintenanceScore,
      drillsCount: drills.data?.length || 0,
      incidentsCount: incidents.data?.length || 0,
      trainingCompletion: 85 // Mocked for now as training table is complex linkage
    };
  },

  // Risks
  async getRisks(orgId) {
    const { data } = await supabase.from('fire_safety_risks').select('*').eq('org_id', orgId);
    return data || [];
  },
  async createRisk(payload) {
    const { data, error } = await supabase.from('fire_safety_risks').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // Equipment
  async getEquipment(orgId) {
    const { data } = await supabase.from('fire_equipment_inventory').select('*').eq('org_id', orgId);
    return data || [];
  },
  async createEquipment(payload) {
    const { data, error } = await supabase.from('fire_equipment_inventory').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // Drills
  async getDrills(orgId) {
    const { data } = await supabase.from('fire_drills').select('*').eq('org_id', orgId).order('drill_date', { ascending: false });
    return data || [];
  },
  async logDrill(payload) {
    const { data, error } = await supabase.from('fire_drills').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // Incidents
  async getIncidents(orgId) {
    const { data } = await supabase.from('fire_incidents').select('*').eq('org_id', orgId).order('incident_date', { ascending: false });
    return data || [];
  },
  async createIncident(payload) {
    const { data, error } = await supabase.from('fire_incidents').insert(payload).select().single();
    if (error) throw error; return data;
  },

  // Compliance
  async getCompliance(orgId) {
    const { data } = await supabase.from('fire_safety_compliance').select('*').eq('org_id', orgId);
    return data || [];
  }
};