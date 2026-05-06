import { useHSE } from '@/context/HSEContext';

export function useHSEAccess() {
  const { 
    role, 
    accessLevel, 
    limits, 
    usageMetrics, 
    isFeatureAvailable, 
    checkPermission,
    trackUsage 
  } = useHSE();

  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin' || isSuperAdmin;
  const isManager = role === 'manager' || isOrgAdmin;
  const isPremium = accessLevel === 'premium' || isSuperAdmin;
  
  return {
    // Roles
    role,
    isSuperAdmin,
    isOrgAdmin,
    isManager,
    
    // Subscription/Access Level
    accessLevel,
    isPremium,
    isFreeTier: !isPremium,

    // Limits & Usage
    limits,
    usageMetrics,
    
    // Helpers
    canAccess: checkPermission, // Pass 'manager', 'supervisor', etc.
    canUseFeature: isFeatureAvailable, // Pass 'emails', 'images', 'videos'
    track: trackUsage
  };
}