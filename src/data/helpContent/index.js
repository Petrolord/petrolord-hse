import { dashboardGuide } from './dashboardGuide';
import { quickReportGuide } from './quickReportGuide';
import { aiAnalyticsGuide } from './aiAnalyticsGuide';
import { healthModuleGuide } from './healthModuleGuide';
import { securityModuleGuide } from './securityModuleGuide';
import { environmentModuleGuide } from './environmentModuleGuide';
import { riskManagementGuide } from './riskManagementGuide';
import { contractorSafetyGuide } from './contractorSafetyGuide';
import { workPermitsGuide } from './workPermitsGuide';
import { trainingGuide } from './trainingGuide';
import { safetyAuditsGuide } from './safetyAuditsGuide';
import { actionTrackerGuide } from './actionTrackerGuide';
import { teamManagementGuide } from './teamManagementGuide';
import { qrObservationsGuide } from './qrObservationsGuide';
import { orgSetupGuide } from './orgSetupGuide';
import { safetyMomentsGuide } from './safetyMomentsGuide';
import { reportingGuide } from './reportingGuide';
import { troubleshootingGuide } from './troubleshootingGuide';
import { glossary } from './glossary';

export const allGuides = {
  dashboard: dashboardGuide,
  'quick-report': quickReportGuide,
  analytics: aiAnalyticsGuide,
  health: healthModuleGuide,
  security: securityModuleGuide,
  environment: environmentModuleGuide,
  risk: riskManagementGuide,
  contractor: contractorSafetyGuide,
  'work-permits': workPermitsGuide,
  training: trainingGuide,
  audit: safetyAuditsGuide,
  actions: actionTrackerGuide,
  team: teamManagementGuide,
  'qr-observations': qrObservationsGuide,
  'org-setup': orgSetupGuide,
  'safety-moments': safetyMomentsGuide,
  reporting: reportingGuide,
  troubleshooting: troubleshootingGuide,
  glossary: glossary,
};

export const guideList = Object.values(allGuides);
