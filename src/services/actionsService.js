import { supabase } from '@/lib/customSupabaseClient';
import { enrichActions } from './dataEnrichmentService';

export const actionsService = {
  /**
   * Fetch actions with filtering and sorting
   * Fixed: Removed .schema('hse') and used manual enrichment
   */
  async getActions(orgId, filters = {}) {
    // 1. Fetch raw actions
    let query = supabase
      .from('actions')
      .select('*')
      .eq('organization_id', orgId);

    // Text Search
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,action_code.ilike.%${filters.search}%`);
    }

    // Checkbox filters
    if (filters.status?.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.priority?.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters.isOverdue) {
      query = query.lt('due_date', new Date().toISOString()).neq('status', 'closed');
    }

    // Dropdown filters (assigned_to is handled after enrichment or via exact ID match if possible)
    if (filters.assigned_to && filters.assigned_to !== 'all') {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    // Date Range
    if (filters.dateRange?.from) {
      query = query.gte('due_date', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      query = query.lte('due_date', filters.dateRange.to.toISOString());
    }
    
    // Default sorting
    query = query.order('due_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching actions:", error);
      return [];
    }

    // 2. Enrich data manually
    return await enrichActions(data);
  },

  /**
   * Get details for a single action
   */
  async getActionDetails(actionId) {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('id', actionId)
      .single();
    
    if (error) throw error;
    
    const [enriched] = await enrichActions([data]);
    return enriched;
  },

  /**
   * Universal update function for an action
   */
  async updateAction(id, updates) {
    // Add current status to history if status is changing
    if (updates.status) {
      const { data: currentAction } = await supabase.from('actions').select('status, status_history').eq('id', id).single();
      if (currentAction) {
        const newHistoryEntry = {
            status: currentAction.status,
            changed_at: new Date().toISOString(),
            user: 'system' 
        };
        const existingHistory = currentAction.status_history || [];
        updates.status_history = [...existingHistory, newHistoryEntry];
      }
    }
      
    const { data, error } = await supabase
      .from('actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add a comment to an action
   */
  async addComment(actionId, userId, content) {
    const { data: action, error: fetchError } = await supabase
      .from('actions')
      .select('meta_data')
      .eq('id', actionId)
      .single();

    if (fetchError) throw fetchError;

    const currentComments = action.meta_data?.comments || [];
    const newComment = {
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    };
    
    const { error: updateError } = await this.updateAction(actionId, {
      meta_data: {
        ...action.meta_data,
        comments: [...currentComments, newComment]
      }
    });

    if (updateError) throw updateError;
    return newComment;
  },

  async submitForApproval(id) {
    return this.updateAction(id, { status: 'pending_approval' });
  },

  async approveAction(id, approverId, comments) {
    return this.updateAction(id, {
      status: 'closed',
      approver_id: approverId,
      closure_comment: comments
    });
  },

  async rejectAction(id, approverId, comments) {
    return this.updateAction(id, {
      status: 'open',
      approver_id: approverId,
      closure_comment: comments
    });
  }
};