import { Activity, ClipboardList, Thermometer, UserCheck, FileCheck, Flame, BarChart2 } from 'lucide-react';

export const healthModuleGuide = {
  id: 'health',
  title: 'Health Module Guide',
  icon: Activity,
  description: 'Complete guide to managing health incidents, occupational health, and hygiene.',
  sections: [
    {
      id: 'overview',
      title: 'Health Module Overview',
      description: 'The Health Module is the central hub for all health-related data and processes within Petrolord HSE.',
      content: [
        { type: 'paragraph', text: 'This module is designed to help organizations track, manage, and improve the health and wellbeing of their workforce. It integrates incident reporting, medical records, and occupational hygiene monitoring into a single interface.' },
        { type: 'alert', variant: 'info', title: 'Key Capabilities', text: 'Real-time incident tracking, HIPAA-compliant medical records, and integrated risk assessments.' }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard Guide',
      description: 'Understanding the Health Dashboard metrics and KPIs.',
      content: [
        { type: 'paragraph', text: 'The main dashboard provides an executive summary of the organization\'s health status.' },
        { type: 'step-list', items: [
          { title: 'Health Score', description: 'An aggregate score (0-100) based on incidents, compliance, and training.' },
          { title: 'TRIFR', description: 'Total Recordable Injury Frequency Rate - calculated automatically.' },
          { title: 'Active Cases', description: 'Number of open health incidents currently under investigation.' }
        ]}
      ]
    },
    {
      id: 'incidents',
      title: 'Health Incidents',
      description: 'Reporting and managing health-related incidents.',
      subsections: [
        {
          title: 'What is a Health Incident?',
          content: [
            { type: 'paragraph', text: 'Any work-related event that results in injury, illness, or fatality.' }
          ]
        },
        {
          title: 'How to Report a Health Incident',
          content: [
            { type: 'step-list', items: [
              { title: 'Navigate to Health Module', description: 'Click on the Health icon in the main sidebar.' },
              { title: 'Click "Report Incident"', description: 'Located in the top right corner of the dashboard.' },
              { title: 'Select Incident Type', description: 'Choose "Health" or "Medical" from the dropdown.' },
              { title: 'Fill Details', description: 'Complete date, time, affected person, and detailed description fields.' },
              { title: 'Attach Evidence', description: 'Upload photos or documents related to the incident.' },
              { title: 'Submit', description: 'The incident will be logged and relevant supervisors notified.' }
            ]}
          ]
        },
        {
          title: 'Severity Levels',
          content: [
            { type: 'list', items: [
              'Critical: Life-threatening condition or fatality. Immediate notification required.',
              'High: Severe injury requiring hospitalization or lost time > 3 days.',
              'Medium: Injury requiring medical treatment beyond first aid.',
              'Low: Minor injury requiring only first aid.'
            ]}
          ]
        }
      ]
    },
    {
      id: 'occupational',
      title: 'Occupational Health',
      description: 'Managing ongoing health surveillance and fitness for duty.',
      content: [
        { type: 'paragraph', text: 'Occupational health tracking ensures that employees are fit for their specific roles and that workplace exposures are monitored.' },
        { type: 'alert', variant: 'warning', title: 'Confidentiality', text: 'Medical records are visible only to users with the "Medical Officer" or "Health Admin" role.' },
        { type: 'step-list', items: [
          { title: 'Medical Records', description: 'Store digital copies of physicals and certifications.' },
          { title: 'Fitness for Duty', description: 'Track status (Fit, Unfit, Fit with Restrictions).' },
          { title: 'Health Surveillance', description: 'Schedule and track periodic health checks (Audiometry, Spirometry).' }
        ]}
      ]
    },
    {
      id: 'fire-safety',
      title: 'Fire Safety',
      description: 'Fire prevention, drills, and equipment management.',
      content: [
        { type: 'paragraph', text: 'This tab consolidates fire safety protocols, drill schedules, and extinguisher maintenance logs.' },
        { type: 'list', items: [
          'Fire Drill Schedule & Reporting',
          'Extinguisher Inspection Logs',
          'Fire Marshal Assignments',
          'Emergency Evacuation Plans'
        ]}
      ]
    },
    {
      id: 'contractors',
      title: 'Contractors & Visitors',
      description: 'Managing non-employee health and safety.',
      content: [
        { type: 'paragraph', text: 'Ensure all contractors and visitors meet health requirements before entering site.' },
        { type: 'step-list', items: [
          { title: 'Induction', description: 'Verify completion of safety induction.' },
          { title: 'Permit Verification', description: 'Check valid permits for work.' }
        ]}
      ]
    }
  ]
};