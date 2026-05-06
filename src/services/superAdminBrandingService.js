import { supabase } from '@/lib/customSupabaseClient';

export const superAdminBrandingService = {
  async getAllOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        id, 
        name, 
        subscription_tier, 
        created_at,
        organization_branding (
          is_branding_enabled,
          updated_at
        )
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getOrganizationBranding(orgId) {
    const { data, error } = await supabase
      .from('organization_branding')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateOrganizationBranding(orgId, brandingData) {
    // Ensure subscription tier allows branding
    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    if (org?.subscription_tier === 'free' && brandingData.is_branding_enabled) {
      throw new Error("Free tier organizations cannot have custom branding enabled.");
    }

    const { data, error } = await supabase
      .from('organization_branding')
      .upsert({
        organization_id: orgId,
        ...brandingData,
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkUpdateBranding(orgIds, brandingData) {
    const updates = orgIds.map(orgId => ({
      organization_id: orgId,
      ...brandingData,
      updated_at: new Date()
    }));

    const { data, error } = await supabase
      .from('organization_branding')
      .upsert(updates, { onConflict: 'organization_id' });

    if (error) throw error;
    return data;
  },

  async uploadAsset(file, type) {
    const fileExt = file.name.split('.').pop();
    const fileName = `assets/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('org-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('branding_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTemplate(templateData) {
    const { data, error } = await supabase
      .from('branding_templates')
      .insert(templateData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTemplate(id) {
    const { error } = await supabase
      .from('branding_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};