import { Lock, ShieldAlert, Eye, UserX, FileWarning } from 'lucide-react';

export const securityModuleGuide = {
  id: 'security',
  title: 'Security Module Guide',
  icon: Lock,
  description: 'Comprehensive guide to physical and digital security management.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: [
        { type: 'paragraph', text: 'The Security Module manages access control, security incidents, threats, and surveillance data.' }
      ]
    },
    {
      id: 'incidents',
      title: 'Security Incidents',
      description: 'Reporting theft, unauthorized access, and other security breaches.',
      content: [
        { type: 'step-list', items: [
          { title: 'Report Incident', description: 'Log security breaches immediately via the dashboard.' },
          { title: 'Categorize', description: 'Select from Theft, Vandalism, Unauthorized Access, or Cyber Event.' },
          { title: 'Investigate', description: 'Assign an investigator to gather evidence and interview witnesses.' }
        ]}
      ]
    },
    {
      id: 'access-control',
      title: 'Access Control',
      description: 'Managing physical and digital access permissions.',
      content: [
        { type: 'paragraph', text: 'Petrolord integrates with common badge systems to log entry and exit times.' },
        { type: 'alert', variant: 'info', title: 'Integration', text: 'Badge data is synced every 15 minutes from the physical access control system.' }
      ]
    },
    {
      id: 'threats',
      title: 'Threat Management',
      content: [
        { type: 'paragraph', text: 'Track external threats and raise alert levels for specific sites.' },
        { type: 'list', items: [
          'Threat Level Identification (Low, Guarded, Elevated, High, Severe)',
          'Local Intelligence Reporting',
          'Travel Security Advisories'
        ]}
      ]
    }
  ]
};