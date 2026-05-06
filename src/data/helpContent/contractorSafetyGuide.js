import { Shield, Users, FileCheck, ClipboardList, Briefcase, AlertTriangle, GraduationCap, Award, BarChart2, Layers, GitBranch, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export const contractorSafetyGuide = {
  id: 'contractor-safety',
  title: 'Contractor Safety Management Guide',
  icon: Shield,
  description: 'Complete guide to managing contractor compliance, inductions, permits, and safety performance.',
  sections: [
    {
      id: 'overview',
      title: 'Module Overview',
      icon: Layers,
      description: 'Understanding the Contractor Safety Module',
      content: [
        { type: 'paragraph', text: 'The Contractor Safety Module is a centralized system designed to manage the full lifecycle of contractor safety, from pre-qualification and induction to performance monitoring and close-out. It ensures that all external workers meet your organization\'s safety standards before and during their work on site.' },
        { type: 'alert', variant: 'info', title: 'Why is this important?', text: 'Contractors often perform high-risk work. Ensuring they are competent, inducted, and compliant reduces incident rates and liability.' },
        { type: 'paragraph', text: 'Key features include:' },
        { type: 'list', items: [
          'Digital Inductions & Training',
          'Electronic Work Permits (ePTW)',
          'Real-time Compliance Tracking',
          'Contractor Performance Rating',
          'Integrated Incident Reporting'
        ]}
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard Guide',
      icon: BarChart2,
      description: 'Navigating the Contractor Safety Dashboard',
      content: [
        { type: 'paragraph', text: 'The dashboard provides an at-a-glance view of your contractor safety ecosystem.' },
        { type: 'step-list', items: [
          { title: 'Total Contractors', description: 'Total number of contractor companies registered in the system.' },
          { title: 'Active Contractors', description: 'Number of contractors currently approved to work on site.' },
          { title: 'Compliance Rate', description: 'Percentage of active contractors meeting all safety requirements (insurance, certifications, training).' },
          { title: 'Active Permits', description: 'Number of open work permits currently in effect.' }
        ]},
        { type: 'paragraph', text: 'Use the "Quick Actions" panel to immediately launch common tasks like issuing a permit or starting an induction.' }
      ]
    },
    {
      id: 'management',
      title: 'Contractor Management',
      icon: Users,
      description: 'Onboarding and managing contractor companies.',
      subsections: [
        {
          title: 'Adding a New Contractor',
          content: [
            { type: 'step-list', items: [
              { title: 'Navigate to Contractors Tab', description: 'Click on the "Contractors" tab in the module navigation.' },
              { title: 'Click "Add Contractor"', description: 'Located in the top right corner.' },
              { title: 'Enter Company Details', description: 'Fill in Company Name, Contact Person, Email, and Phone.' },
              { title: 'Set Classification', description: 'Assign Tier level (1, 2, or 3) based on risk profile.' },
              { title: 'Upload Documents', description: 'Attach required insurance and license documents.' },
              { title: 'Save', description: 'The contractor profile is created in "Pending" status until approved.' }
            ]}
          ]
        },
        {
          title: 'Contractor Tiers & Risk Rating',
          content: [
            { type: 'list', items: [
              'Tier 1 (High Risk): Major construction, hazardous work. Requires full pre-qualification and frequent audits.',
              'Tier 2 (Medium Risk): Maintenance, facilities services. Standard requirements.',
              'Tier 3 (Low Risk): Delivery, consulting. Minimal requirements.'
            ] }
          ]
        }
      ]
    },
    {
      id: 'inductions',
      title: 'Induction Management',
      icon: FileCheck,
      description: 'Managing safety inductions for contractor personnel.',
      content: [
        { type: 'paragraph', text: 'Inductions ensure every individual worker understands site rules and hazards before entering.' },
        { type: 'step-list', items: [
          { title: 'Assign Induction', description: 'Select a contractor company or individual worker and assign a specific induction module (e.g., "General Site Safety").' },
          { title: 'Online Completion', description: 'Workers can complete modules remotely via the portal, watching videos and taking quizzes.' },
          { title: 'Verification', description: 'Safety officers verify completion and check IDs upon first arrival.' },
          { title: 'Digital Pass', description: 'System generates a digital safety pass/QR code for site access.' }
        ]}
      ]
    },
    {
      id: 'briefings',
      title: 'Safety Briefings',
      icon: ClipboardList,
      description: 'Daily toolbox talks and safety briefings.',
      content: [
        { type: 'paragraph', text: 'Record daily toolbox talks to ensure continuous safety communication.' },
        { type: 'list', items: [
          'Create briefing topics based on daily hazards.',
          'Record attendance digitally (bulk select or QR scan).',
          'Track briefing history per contractor to ensure engagement.'
        ]}
      ]
    },
    {
      id: 'permits',
      title: 'Permit to Work (PTW)',
      icon: Briefcase,
      description: 'Issuing and managing electronic work permits.',
      content: [
        { type: 'paragraph', text: 'High-risk activities require a permit to work. The digital workflow streamlines approval.' },
        { type: 'step-list', items: [
          { title: 'Request Permit', description: 'Contractors or supervisors request a permit, specifying location, work type (Hot Work, Confined Space, etc.), and duration.' },
          { title: 'Risk Assessment', description: 'Attach JSA/JHA (Job Safety Analysis) to the permit request.' },
          { title: 'Approval Workflow', description: 'System routes request to relevant area owners and safety officers for digital signature.' },
          { title: 'Activation', description: 'Permit becomes active only after on-site verification of controls.' },
          { title: 'Closure', description: 'Work is inspected and permit is formally closed upon completion.' }
        ]}
      ]
    },
    {
      id: 'incidents',
      title: 'Incidents & Near Misses',
      icon: AlertTriangle,
      description: 'Reporting and investigating contractor-related events.',
      content: [
        { type: 'paragraph', text: 'It is critical to capture incidents involving contractors to maintain a true safety picture.' },
        { type: 'alert', variant: 'warning', title: 'Reporting Protocol', text: 'Contractors must report incidents immediately. Use the "Report Incident" button on the dashboard.' },
        { type: 'step-list', items: [
          { title: 'Log Event', description: 'Capture date, time, location, and involved contractor.' },
          { title: 'Classify', description: 'Determine if it is an Incident (harm occurred) or Near Miss (potential harm).' },
          { title: 'Investigate', description: 'Assign investigation tasks. Root cause analysis should involve contractor representatives.' },
          { title: 'Corrective Actions', description: 'Assign actions to the contractor to prevent recurrence.' }
        ]}
      ]
    },
    {
      id: 'training',
      title: 'Training & Competency',
      icon: GraduationCap,
      description: 'Tracking specialized skills and certifications.',
      content: [
        { type: 'paragraph', text: 'Beyond basic induction, track specific competencies (e.g., Forklift License, Welder Certification).' },
        { type: 'list', items: [
          'Upload certificates directly to worker profiles.',
          'Set expiration dates to trigger automatic renewal alerts.',
          'Block permit issuance if required competencies are expired.'
        ]}
      ]
    },
    {
      id: 'performance',
      title: 'Performance & Compliance',
      icon: Award,
      description: 'Evaluating contractor safety performance.',
      content: [
        { type: 'paragraph', text: 'Regularly evaluate contractors to maintain high standards.' },
        { type: 'step-list', items: [
          { title: 'Performance Reviews', description: 'Conduct periodic reviews (monthly/quarterly) based on incidents, housekeeping, and rule adherence.' },
          { title: 'Scoring', description: 'System calculates a safety score based on weighted metrics.' },
          { title: 'Feedback Loop', description: 'Share scorecards with contractors to drive improvement.' }
        ]}
      ]
    },
    {
      id: 'integration',
      title: 'Integration',
      icon: GitBranch,
      content: [
        { type: 'paragraph', text: 'The Contractor Safety module is deeply integrated with:' },
        { type: 'list', items: [
          'Health Module: For injury tracking.',
          'Security Module: For site access control based on induction status.',
          'Risk Management: For JSA/JHA linking to permits.',
          'Action Tracker: For managing corrective actions assigned to contractors.'
        ]}
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: CheckCircle,
      content: [
        { type: 'list', items: [
          'Pre-qualify ALL contractors before they arrive on site.',
          'Enforce strict "No Induction, No Access" rules.',
          'Conduct random spot checks on permit compliance.',
          'Include safety performance in contract renewal decisions.'
        ]}
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      content: [
        { type: 'step-list', items: [
          { title: 'Cannot find contractor?', description: 'Ensure the filter is not set to "Active" only; they might be "Pending" or "Inactive".' },
          { title: 'Permit approval stuck?', description: 'Check the approval workflow settings to see whose signature is pending.' },
          { title: 'Induction video not playing?', description: 'Advise user to check internet connection or try a different browser (Chrome recommended).' }
        ]}
      ]
    }
  ]
};