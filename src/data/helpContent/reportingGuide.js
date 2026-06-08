import { FileText } from 'lucide-react';

export const reportingGuide = {
  id: 'reporting',
  title: 'Reporting & Exports Guide',
  icon: FileText,
  description: 'Where to find reports, track submissions, and export your data.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Reporting lives in a few connected places.',
      content: [
        { type: 'paragraph', text: 'Petrolord HSE doesn’t bury reporting in one screen. Depending on what you need, you’ll use:' },
        { type: 'list', items: [
          'My Reports — track the reports you have submitted',
          'Supervisor View — triage, investigate and resolve incoming reports (supervisors/managers)',
          'Module Reporting tabs — purpose-built exports inside Environment and Risk',
          'Export / Print buttons — on most registers and tables, for ad-hoc CSV or PDF',
          'Analytics & the AI Safety Predictor — trends and forward-looking insight',
        ]},
      ],
    },
    {
      id: 'my-reports',
      title: 'My Reports',
      description: 'Track what you have submitted.',
      content: [
        { type: 'paragraph', text: 'My Reports lists every report you have filed with its current status (submitted → acknowledged → in progress → resolved → closed). Search and filter by status, and open any report to see its full detail and progress.' },
      ],
    },
    {
      id: 'supervisor-view',
      title: 'Supervisor View',
      description: 'For those who action reports.',
      content: [
        { type: 'paragraph', text: 'Supervisors and managers use the Supervisor View to work the queue of incoming reports.' },
        { type: 'list', items: [
          'Filter by status and severity, and see pending / critical / in-progress / closed counts',
          'Open a report to view details and transcription',
          'Run a 5 Whys investigation (root cause, corrective and preventive actions, lessons learned)',
          'Assign an owner, review the audit trail, and mark the report resolved',
        ]},
      ],
    },
    {
      id: 'exports',
      title: 'Exporting Data (CSV & Print)',
      description: 'Get data out of any register.',
      content: [
        { type: 'paragraph', text: 'Most registers and tables have an Export button that produces a CSV; some reports also offer Print (save as PDF).' },
        { type: 'step-list', items: [
          { title: 'Open the register', description: 'e.g. the Risk Register, or an Environment register such as Permits.' },
          { title: 'Apply any filters / search', description: 'The export reflects what is currently shown where applicable.' },
          { title: 'Click Export', description: 'A CSV downloads. If the register is empty, you’ll be told there is nothing to export rather than getting a blank file.' },
        ]},
        { type: 'alert', variant: 'info', title: 'On-demand', text: 'Exports are generated on demand when you click. Open the relevant module to pull the latest data whenever you need it.' },
      ],
    },
    {
      id: 'module-reporting',
      title: 'Module Reporting Tabs',
      description: 'Purpose-built reporting inside modules.',
      content: [
        { type: 'paragraph', text: 'Some modules have a dedicated Reporting tab:' },
        { type: 'list', items: [
          'Environment → Reporting: an export centre with a NUPRC Monthly Pack (this month’s monitoring), an Annual Environmental Report (year-to-date spills, waste and monitoring), and per-register CSV exports (Permits, Monitoring, Spills, Waste, Studies).',
          'Risk → Reporting: a summary of totals, critical count, average score and breakdowns by category and status, with CSV export and Print.',
        ]},
      ],
    },
    {
      id: 'analytics-link',
      title: 'Analytics & AI Forecasts',
      description: 'From reporting to foresight.',
      content: [
        { type: 'paragraph', text: 'For trends and prediction rather than record-keeping, use the Analytics view and the AI Safety Predictor. The predictor turns your submitted reports into a 30-day forecast of likely incidents and preventive actions — see the AI Safety Predictor & Analytics guide.' },
      ],
    },
  ],
};
