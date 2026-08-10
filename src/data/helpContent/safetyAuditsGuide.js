import { ClipboardCheck, Layers, Calendar, FileSearch, AlertTriangle, BarChart2, Filter, CheckCircle, HelpCircle } from 'lucide-react';

export const safetyAuditsGuide = {
  id: 'audit',
  title: 'Safety Audits Guide',
  icon: ClipboardCheck,
  description: 'Plan, schedule, and track safety audits across your sites, from internal reviews to contractor and system audits.',
  sections: [
    {
      id: 'overview',
      title: 'Module Overview',
      icon: Layers,
      description: 'Understanding the Safety Audits Module',
      content: [
        { type: 'paragraph', text: 'The Safety Audits Module helps you plan and keep track of safety audits across your organization. An audit is a structured check of how well a site, team, or system meets your safety standards. Scheduling and recording audits ensures issues are caught early and that nothing slips through the cracks.' },
        { type: 'paragraph', text: 'The module is organized into four tabs, shown at the top of the screen:' },
        { type: 'list', items: [
          'Schedule — the main working area, where you create and view planned audits.',
          'Internal Audits — a dedicated workspace for conducting internal reviews (in progress).',
          'Findings — for logging and tracking issues raised during audits (in progress).',
          'Reporting — for audit summaries and trend reports (in progress).'
        ]},
        { type: 'alert', variant: 'info', title: 'Where to start', text: 'The Schedule tab is fully available today. Use the "Schedule Audit" button in the top right to create your first audit.' },
        { type: 'alert', variant: 'warning', title: 'Tabs in progress', text: 'The Internal Audits, Findings, and Reporting tabs are still being built. Selecting one currently shows a "coming soon" message. These features are on the roadmap and will be activated in a future release.' }
      ]
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: Calendar,
      description: 'The main view for planning and tracking audits.',
      content: [
        { type: 'paragraph', text: 'The Schedule tab is the heart of the module. It lists every audit that has been planned, in a table that shows the audit ID, type, scheduled date, assigned auditor, location, and current status.' },
        { type: 'paragraph', text: 'Each audit row displays a status badge so you can see progress at a glance:' },
        { type: 'list', items: [
          'Scheduled — the audit is planned but has not started yet.',
          'In Progress — the audit is currently underway.',
          'Completed — the audit has been finished.',
          'Overdue — the scheduled date has passed without completion.'
        ]},
        { type: 'paragraph', text: 'Use the "View" button on the right of any row to open that audit, and the Filters panel on the left to narrow the list down (see the Filters section below).' },
        { type: 'alert', variant: 'info', title: 'Empty list?', text: 'If no audits appear, the table shows "No scheduled audits found." This is normal for a new organization. Click "Schedule Audit" to add one.' }
      ],
      subsections: [
        {
          title: 'Scheduling a New Audit',
          content: [
            { type: 'paragraph', text: 'Scheduling an audit is the primary action in this module. Follow these steps:' },
            { type: 'step-list', items: [
              { title: 'Click "Schedule Audit"', description: 'Find the purple "Schedule Audit" button in the top right corner of the screen. This opens the "Schedule New Audit" window.' },
              { title: 'Choose the Audit Type', description: 'Pick one of Internal, Contractor, Site, or System. This describes what the audit is focused on. It defaults to Internal.' },
              { title: 'Set the Scheduled Date', description: 'Select the date the audit should take place. This field is required.' },
              { title: 'Select a Location', description: 'Choose the site where the audit will be carried out from the Location list. The list is drawn from the sites registered to your organization.' },
              { title: 'Assign an Auditor', description: 'Choose the person responsible for carrying out the audit from the Auditor list, which shows members of your organization.' },
              { title: 'Add Scope / Notes', description: 'Optionally describe what the audit will cover or add any notes for the auditor.' },
              { title: 'Click "Schedule"', description: 'The audit is saved with a generated audit ID and appears in the Schedule table. You will see a confirmation message when it succeeds.' }
            ]},
            { type: 'alert', variant: 'info', title: 'Audit IDs', text: 'Each new audit is automatically given a unique ID in the form AUD-XXXX, so you do not need to create one yourself.' }
          ]
        },
        {
          title: 'Filtering Audits',
          content: [
            { type: 'paragraph', text: 'The Filters panel appears on the left side of the Schedule tab. It lets you focus the audit list on what matters to you.' },
            { type: 'list', items: [
              'Type — show only audits of a chosen type (Internal, Contractor, Site, or System), or All Types.',
              'Status — show only audits with a chosen status (Scheduled, In Progress, Completed, or Overdue), or All Status.',
              'Clear — reset both filters back to showing everything.'
            ]},
            { type: 'alert', variant: 'info', title: 'Filters apply to the Schedule tab only', text: 'The Filters panel is shown when you are on the Schedule tab. It updates the audit table as soon as you change a selection.' }
          ]
        }
      ]
    },
    {
      id: 'internal',
      title: 'Internal Audits',
      icon: FileSearch,
      description: 'A dedicated workspace for conducting internal audits.',
      content: [
        { type: 'paragraph', text: 'The Internal Audits tab is intended to give auditors a focused space for carrying out internal safety reviews, including checklists and step-by-step audit execution.' },
        { type: 'alert', variant: 'warning', title: 'In progress', text: 'This tab is still under construction. Selecting it currently shows a "coming soon" message. In the meantime, you can plan internal audits by choosing the "Internal" type when scheduling on the Schedule tab.' }
      ]
    },
    {
      id: 'findings',
      title: 'Findings',
      icon: AlertTriangle,
      description: 'Logging and tracking issues raised during audits.',
      content: [
        { type: 'paragraph', text: 'The Findings tab is designed to capture observations and non-conformances identified during an audit, so they can be tracked through to resolution.' },
        { type: 'alert', variant: 'warning', title: 'In progress', text: 'This tab is still under construction and currently shows a "coming soon" message. Findings management will be enabled in a future release.' }
      ]
    },
    {
      id: 'reports',
      title: 'Reporting',
      icon: BarChart2,
      description: 'Audit summaries and trend reports.',
      content: [
        { type: 'paragraph', text: 'The Reporting tab is intended to provide summaries, completion statistics, and trends across your audit programme.' },
        { type: 'alert', variant: 'warning', title: 'In progress', text: 'This tab is still under construction and currently shows a "coming soon" message. Reporting will be enabled in a future release.' }
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: CheckCircle,
      content: [
        { type: 'list', items: [
          'Schedule audits ahead of time so auditors and sites can prepare.',
          'Always assign a named auditor so responsibility is clear.',
          'Use the Scope / Notes field to set expectations for what each audit will cover.',
          'Review the Schedule tab regularly and act on anything marked Overdue.',
          'Use the Status and Type filters to quickly check progress for a specific site or audit category.'
        ]}
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      content: [
        { type: 'step-list', items: [
          { title: 'A tab shows "coming soon"?', description: 'The Internal Audits, Findings, and Reporting tabs are still in development. Use the Schedule tab to plan and track audits for now.' },
          { title: 'No locations or auditors in the dropdowns?', description: 'Locations come from the sites set up for your organization, and auditors from your organization members. Make sure sites and users have been added in the relevant setup areas.' },
          { title: 'Audit did not save?', description: 'Confirm a Scheduled Date is set, as it is required. If you see an error message, try again, then check your connection.' },
          { title: 'Cannot find an audit you created?', description: 'Check the Filters panel on the left. Set Type and Status to "All" so nothing is hidden, or use Clear to reset the filters.' }
        ]}
      ]
    }
  ]
};
