import { supabase } from '@/lib/customSupabaseClient';
import { enrichIncidents } from './dataEnrichmentService';
import { notificationService } from '@/services/notificationService';

export const incidentsService = {
  // Get all incidents for an organization
  async getIncidents(orgId, filters = {}) {
    try {
      if (!orgId) return [];

      let query = supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', orgId)
        .order('incident_date', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) query = query.in('status', filters.status);
      if (filters.severity && filters.severity.length > 0) query = query.in('severity', filters.severity);
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);
      // Note: 'assigned_to' filter logic would usually go here but requires more complex joins depending on schema

      const { data, error } = await query;

      if (error) {
        console.warn("Error fetching incidents:", error);
        // Throwing error causes 'failed to load' toast. 
        // For lists, it's often safer to return empty array if we can't fetch, or verify error type.
        // But throwing allows parent to decide.
        // However, if the user is unauthorized/new, they might see error.
        throw error;
      }

      if (!data || data.length === 0) return [];

      // Enrich with reporter and site details
      const enrichedData = await enrichIncidents(data);
      
      // Client-side filter for assigned_to if needed (since it might be an enriched field)
      if (filters.assigned_to && filters.assigned_to !== 'all') {
         return enrichedData.filter(inc => inc.created_by === filters.assigned_to); 
      }

      return enrichedData;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },

  // Get a single incident details
  async getIncidentById(id) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Enrich single item
      const [enriched] = await enrichIncidents([data]);
      return enriched;
    } catch (error) {
      console.error('Error fetching incident details:', error);
      throw error;
    }
  },

  // Update incident status
  async updateIncident(id, updates) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Notify creator if status changes
      if (updates.status && data.created_by) {
         await notificationService.createNotification({
            userId: data.created_by,
            title: 'Incident Status Updated',
            message: `Your report "${data.title}" has been updated to ${updates.status}.`,
            type: 'info',
            link: `/dashboard/incidents?id=${id}`
         });
      }

      return data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },
  
  // Add comment to incident
  async addComment(incidentId, userId, content) {
      try {
          // Fetch current meta_data first
          const { data: incident, error: fetchError } = await supabase
              .from('incidents')
              .select('meta_data, created_by, organization_id')
              .eq('id', incidentId)
              .single();
              
          if (fetchError) throw fetchError;
          
          const currentMeta = incident.meta_data || {};
          const comments = currentMeta.comments || [];
          
          const newComment = {
              id: Date.now(),
              user_id: userId,
              content,
              created_at: new Date().toISOString()
          };
          
          const newMeta = {
              ...currentMeta,
              comments: [...comments, newComment]
          };
          
          const { error: updateError } = await supabase
              .from('incidents')
              .update({ meta_data: newMeta })
              .eq('id', incidentId);
              
          if (updateError) throw updateError;

          // Notify incident owner if someone else comments
          if (userId !== 'current-user' && incident.created_by && incident.created_by !== userId) {
             await notificationService.createNotification({
                userId: incident.created_by,
                title: 'New Comment on Incident',
                message: `New comment on "${incident.title || 'Incident'}": ${content.substring(0, 50)}...`,
                type: 'info',
                link: `/dashboard/incidents?id=${incidentId}`
             });
          }

          return newComment;
      } catch (error) {
          console.error('Error adding comment:', error);
          throw error;
      }
  },

  // Delete incident
  async deleteIncident(id) {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  }
};