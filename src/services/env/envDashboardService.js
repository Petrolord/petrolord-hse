import { supabase } from '@/lib/customSupabaseClient';

export const envDashboardService = {
  async getStats(orgId) {
    // Parallel fetching for performance
    const [permits, emp, flaring, waste, spills] = await Promise.all([
      supabase.from('env_permits').select('status, expiry_date').eq('org_id', orgId),
      supabase.from('env_emp_actions').select('status').eq('org_id', orgId),
      supabase.from('env_flaring_logs').select('volume_m3').eq('org_id', orgId),
      supabase.from('env_waste_manifests').select('quantity').eq('org_id', orgId),
      supabase.from('spill_records').select('severity').eq('org_id', orgId) // Using existing spill table
    ]);

    // Simple aggregations
    const expiringPermits = permits.data?.filter(p => new Date(p.expiry_date) < new Date(Date.now() + 90 * 86400000)).length || 0;
    const overdueActions = emp.data?.filter(a => a.status === 'Overdue').length || 0;
    const totalFlaring = flaring.data?.reduce((acc, curr) => acc + (Number(curr.volume_m3) || 0), 0) || 0;
    const totalWaste = waste.data?.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0) || 0;
    const spillCount = spills.data?.length || 0;

    // Mock compliance score calculation based on overdue items
    let score = 100;
    if (expiringPermits > 0) score -= 10;
    if (overdueActions > 0) score -= 15;
    if (spillCount > 0) score -= 20;
    
    return {
      complianceScore: Math.max(0, score),
      expiringPermits,
      overdueActions,
      totalFlaring,
      totalWaste,
      spillCount
    };
  }
};