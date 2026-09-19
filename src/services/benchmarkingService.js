import { supabase } from '@/lib/customSupabaseClient';

export const benchmarkingService = {
  // Returns the organization's stored benchmark rows, or [] when there are none.
  // No built-in comparison figures: an empty table means there is nothing to compare yet.
  async getBenchmarks(organizationId) {
    const { data, error } = await supabase
      .from('benchmarking_data')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.warn('Error fetching benchmarks:', error);
      return [];
    }
    return data || [];
  }
};
