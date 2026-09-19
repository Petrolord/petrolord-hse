import { supabase } from '@/lib/customSupabaseClient';

// Reads model version records stored for an organization.
// There is no model training pipeline behind this product yet, so this service
// only reads what is persisted: it never returns built-in demo versions and
// never writes generated accuracy figures.
export const modelService = {
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
    return data || [];
  },
};
