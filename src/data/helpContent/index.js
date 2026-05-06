import { healthModuleGuide } from './healthModuleGuide';
import { securityModuleGuide } from './securityModuleGuide';
import { environmentModuleGuide } from './environmentModuleGuide';
import { riskManagementGuide } from './riskManagementGuide';
import { troubleshootingGuide } from './troubleshootingGuide';
import { reportingGuide } from './reportingGuide';
import { glossary } from './glossary';
import { contractorSafetyGuide } from './contractorSafetyGuide';

export const allGuides = {
  health: healthModuleGuide,
  security: securityModuleGuide,
  environment: environmentModuleGuide,
  risk: riskManagementGuide,
  reporting: reportingGuide,
  contractor: contractorSafetyGuide,
  troubleshooting: troubleshootingGuide,
  glossary: glossary
};

export const guideList = Object.values(allGuides);