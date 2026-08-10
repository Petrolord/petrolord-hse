import { Lock } from 'lucide-react';

export const securityModuleGuide = {
  id: 'security',
  title: 'Security Module Guide',
  icon: Lock,
  description: 'Security incidents, access control, threats, awareness, compliance and analytics.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'How the Security module is organised.',
      content: [
        { type: 'paragraph', text: 'The Security module manages physical and personnel security across a row of tabs. It is available to admins, managers and the Security Officer role.' },
        { type: 'list', items: [
          'Dashboard — key security metrics and a quick "Log Security Incident" action',
          'Awareness — security awareness content',
          'Incidents — log and manage security incidents',
          'Access Control — credentials and access logs',
          'Behavioral — behavioural analytics / anomaly monitoring',
          'Threats — threat levels and assessments',
          'Compliance — security compliance status',
          'Analytics — incident analytics and trends',
          'Team — team security view (supervisors only)',
        ]},
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your security posture at a glance.',
      content: [
        { type: 'paragraph', text: 'The Dashboard shows data-backed security metrics — incidents year-to-date, pending security trainings and expiring access credentials — and a prominent "Log Security Incident" button to report an event quickly. Where a figure has no underlying data yet it shows an honest empty state rather than a placeholder number.' },
      ],
    },
    {
      id: 'incidents',
      title: 'Security Incidents',
      description: 'Reporting and managing security events.',
      content: [
        { type: 'paragraph', text: 'Use this tab (or the dashboard button) to record security events such as theft, vandalism, unauthorised access or cyber events, then manage them through to resolution.' },
        { type: 'step-list', items: [
          { title: 'Click "Log Security Incident"', description: 'On the Dashboard or the Incidents tab.' },
          { title: 'Describe the event', description: 'Capture what happened, the category, severity and location.' },
          { title: 'Submit', description: 'The incident is recorded and appears in the incidents list for follow-up.' },
          { title: 'Investigate & resolve', description: 'Assign an investigator, record findings, and update the status as the matter is closed out.' },
        ]},
      ],
    },
    {
      id: 'access-control',
      title: 'Access Control',
      description: 'Credentials and entry/exit activity.',
      content: [
        { type: 'paragraph', text: 'Access Control lists access credentials (type, expiry, status) and recent access-log activity, with summary cards for your current access level, MFA status and recent failed/denied attempts.' },
        { type: 'alert', variant: 'info', title: 'Keep credentials current', text: 'Expiring credentials are surfaced on the Security dashboard — renew them before they lapse to avoid access disruptions.' },
      ],
    },
    {
      id: 'behavioral',
      title: 'Behavioral Analytics',
      description: 'Spotting unusual patterns.',
      content: [
        { type: 'paragraph', text: 'The Behavioral tab is where detected behavioural anomalies and insider-risk indicators are surfaced for review. When there are no anomalies it shows a clear "all clear" state.' },
      ],
    },
    {
      id: 'threats',
      title: 'Threat Management',
      description: 'Track external threats and raise alert levels.',
      content: [
        { type: 'list', items: [
          'Threat level identification (Low, Guarded, Elevated, High, Severe)',
          'Local intelligence and incident context',
          'Travel security advisories',
        ]},
      ],
    },
    {
      id: 'compliance',
      title: 'Compliance',
      description: 'Security compliance status.',
      content: [
        { type: 'paragraph', text: 'The Compliance tab tracks how the organisation is performing against its security requirements and training obligations, so gaps can be actioned.' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Trends across security incidents.',
      content: [
        { type: 'paragraph', text: 'Security Analytics visualises your real security incidents — for example severity distribution and incidents per month — so you can spot trends and recurring problem areas.' },
      ],
    },
  ],
};
