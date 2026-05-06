import { supabase } from '../lib/customSupabaseClient';

/**
 * Get mock security data for fallback
 */
const getMockSecurityData = () => ({
  totalEvents: 154,
  criticalIncidents: 3,
  accessViolations: 12,
  uptime: "99.9%",
  incidents: [
    { 
      id: 1, 
      title: "Unauthorized Access at Main Gate", 
      report_type: "Unauthorized Access",
      severity: "High", 
      status: "Open", 
      incident_date: new Date().toISOString(),
      reference_code: "SEC-1001"
    },
    { 
      id: 2, 
      title: "Lost Badge Reported", 
      report_type: "Physical Security",
      severity: "Low", 
      status: "Resolved", 
      incident_date: new Date(Date.now() - 86400000).toISOString(),
      reference_code: "SEC-1002"
    }
  ],
  accessLogs: [
    { id: 1, user: "John Doe", location: "Server Room", status: "Denied", timestamp: new Date().toISOString() },
    { id: 2, user: "Jane Smith", location: "Main Entrance", status: "Granted", timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]
});

/**
 * Security Service object
 */
export const securityService = {
  /**
   * Get aggregated security statistics
   */
  getSecurityStats: async (orgId) => {
    // In a real implementation, this would aggregate data from the database
    // For now, we return mock data structure
    const mock = getMockSecurityData();
    return {
      totalEvents: mock.totalEvents,
      criticalIncidents: mock.criticalIncidents,
      accessViolations: mock.accessViolations,
      uptime: mock.uptime
    };
  },

  /**
   * Get security incidents
   */
  getIncidents: async (orgId) => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', orgId)
        .eq('hazard_category', 'Security')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      return data.length > 0 ? data : getMockSecurityData().incidents;
    } catch (error) {
      console.error('Error fetching security incidents:', error);
      return getMockSecurityData().incidents;
    }
  },

  /**
   * Get access logs
   */
  getAccessLogs: async (orgId) => {
    // Mocking access logs as there is no specific table in the schema
    return getMockSecurityData().accessLogs;
  },

  /**
   * Create a new security incident
   */
  createSecurityIncident: async (payload) => {
    try {
      const dbPayload = {
        organization_id: payload.org_id,
        reference_code: payload.incident_code,
        title: payload.title,
        report_type: payload.type,
        hazard_category: 'Security',
        severity: payload.severity,
        site_id: payload.location_id,
        description: payload.description,
        incident_date: payload.date,
        status: payload.status,
        created_by: payload.created_by,
        // Store assigned_to in people_involved JSONB column
        people_involved: payload.assigned_to ? [{ role: 'Investigator', user_id: payload.assigned_to }] : []
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating security incident:', error);
      throw error;
    }
  }
};

// Backward compatibility export if needed
export const fetchSecurityData = securityService.getIncidents;