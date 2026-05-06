import { supabase } from '@/lib/customSupabaseClient';

export const templateService = {
  async getTemplates(orgId) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .or(`is_global.eq.true,organization_id.eq.${orgId}`);
      
    if (error) {
      console.error("Error fetching templates", error);
      return [];
    }
    return data;
  },

  async recordUsage(templateId, orgId) {
    // Ideally upsert into template_usage table
    // For now simple insert log could work, but sticking to provided schema intent
    // We'll skip complex analytics implementation for this phase 1 quick win
  }
};