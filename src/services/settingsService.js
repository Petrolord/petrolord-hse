import { supabase } from '@/lib/customSupabaseClient';

export const settingsService = {
  // --- Org Settings ---
  async getOrgSettings(orgId) {
    const { data, error } = await supabase
      .from('org_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching org settings:', error);
      return null;
    }
    return data;
  },

  async upsertOrgSettings(orgId, settings, performedBy = null, actionType = 'settings_update') {
    const { data, error } = await supabase
      .from('org_settings')
      .upsert({ org_id: orgId, ...settings, updated_at: new Date() })
      .select()
      .single();

    if (error) {
      console.error('Error saving org settings:', error);
      throw error;
    }

    // Log the action if performedBy is provided
    if (performedBy) {
      await this.logBrandingAction(orgId, actionType, { settings_updated: true }, performedBy);
    }

    return data;
  },

  async uploadLogo(orgId, file, type = 'logo') {
    const fileExt = file.name.split('.').pop();
    const fileName = `logos/${orgId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('org-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // --- Branding Presets ---
  async getBrandingPresets(orgId) {
    const { data, error } = await supabase
      .from('branding_presets')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async saveBrandingPreset(orgId, name, config, userId) {
    const { data, error } = await supabase
      .from('branding_presets')
      .insert({
        organization_id: orgId,
        name,
        branding_config: config,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    await this.logBrandingAction(orgId, 'preset_created', { name }, userId);
    return data;
  },

  async deleteBrandingPreset(presetId, orgId, userId) {
    const { error } = await supabase
      .from('branding_presets')
      .delete()
      .eq('id', presetId)
      .eq('organization_id', orgId);

    if (error) throw error;
    await this.logBrandingAction(orgId, 'preset_deleted', { presetId }, userId);
  },

  // --- Audit Log ---
  async getBrandingAuditLog(orgId) {
    const { data, error } = await supabase
      .from('branding_audit_log')
      .select('*, performer:performed_by(email)')
      .eq('organization_id', orgId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  async logBrandingAction(orgId, action, changes, userId) {
    // Fire and forget
    supabase
      .from('branding_audit_log')
      .insert({
        organization_id: orgId,
        action,
        changes,
        performed_by: userId
      })
      .then(({ error }) => {
        if (error) console.error('Failed to log branding action', error);
      });
  },

  // --- User Preferences ---
  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
    return data;
  },

  async upsertUserPreferences(userId, prefs) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...prefs, updated_at: new Date() })
      .select()
      .single();

    if (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
    return data;
  }
};