import { supabase } from '@/lib/customSupabaseClient';

export const debugService = {
  async getMasterAppsCount() {
    const { count, error } = await supabase
      .from('master_apps')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count;
  },

  async getMasterAppsSchema() {
    // Note: This is a simulated schema fetch as client-side cannot access information_schema directly easily
    // We fetch one record to infer keys
    const { data, error } = await supabase
      .from('master_apps')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  },

  async getSampleApps() {
    const { data, error } = await supabase
      .from('master_apps')
      .select('*')
      .limit(5);
    if (error) throw error;
    return data;
  }
};