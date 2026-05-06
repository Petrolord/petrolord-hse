export const FEATURES = {
  // Core Modules
  HSE_CORE: 'hse',
  SUITE_CORE: 'suite',

  // Specific Paid Features
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_REPORTS: 'custom_reports',
  DATA_EXPORT: 'data_export',
  API_ACCESS: 'api_access',
  AUDIT_TRAILS: 'audit_trails',
  BULK_OPERATIONS: 'bulk_operations',
  CUSTOM_WORKFLOWS: 'custom_workflows',
  PRIORITY_SUPPORT: 'priority_support',
  
  // Free Features (Explicitly defined for clarity)
  BASIC_INCIDENTS: 'basic_incidents',
  BASIC_OBSERVATIONS: 'basic_observations'
};

// Features available to free tier users
export const FREE_TIER_FEATURES = [
  FEATURES.HSE_CORE,
  FEATURES.BASIC_INCIDENTS,
  FEATURES.BASIC_OBSERVATIONS
];

// Features that require 'hse_paid' or 'suite' subscription
export const PREMIUM_FEATURES = [
  FEATURES.ADVANCED_ANALYTICS,
  FEATURES.CUSTOM_REPORTS,
  FEATURES.DATA_EXPORT,
  FEATURES.API_ACCESS,
  FEATURES.AUDIT_TRAILS,
  FEATURES.BULK_OPERATIONS,
  FEATURES.CUSTOM_WORKFLOWS,
  FEATURES.PRIORITY_SUPPORT
];