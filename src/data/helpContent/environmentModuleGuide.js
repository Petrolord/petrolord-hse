import { Leaf } from 'lucide-react';

export const environmentModuleGuide = {
  id: 'environment',
  title: 'Environment Module Guide',
  icon: Leaf,
  description: 'Permits, monitoring, emissions, waste, spills, decommissioning and compliance reporting.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'What the Environment module does and how it is organised.',
      content: [
        { type: 'paragraph', text: 'The Environment module is your single place to manage environmental compliance — regulatory permits, monitoring data, emissions, waste, spill incidents, asset decommissioning, and the reports regulators ask for.' },
        { type: 'paragraph', text: 'It opens on the Dashboard and is organised into tabs across the top. All data is scoped to your organization.' },
        { type: 'list', items: [
          'Dashboard — compliance health score, key counts, and Quick Actions',
          'Obligations & Permits — your permit register',
          'Studies & EMP — environmental studies and Environmental Management Plan actions',
          'Monitoring — environmental sample results vs. regulatory limits',
          'Emissions & Flaring — flaring/emissions logs',
          'Waste & Chemicals — waste manifests',
          'Spills — spill incident register',
          'Decommissioning — facility closure / lifecycle status',
          'Reporting — export-ready compliance packs',
        ]},
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Compliance health at a glance, plus one-click Quick Actions.',
      content: [
        { type: 'paragraph', text: 'The Dashboard shows a Compliance Health score (calculated from valid permits and on-track EMP actions, minus open spills) and KPI tiles: permits due within 90 days, overdue actions, spills, flaring volume and waste generated. When there is no data yet, values show "--" rather than a fabricated number.' },
        { type: 'paragraph', text: 'The Quick Actions panel lets you jump straight into the most common tasks:' },
        { type: 'step-list', items: [
          { title: 'Log New Spill', description: 'Switches to the Spills tab and opens the spill form so you can record an incident immediately.' },
          { title: 'Submit Monitoring Data', description: 'Switches to the Monitoring tab and opens the sample-entry form.' },
          { title: 'Generate Compliance Pack', description: 'Exports your permit register (with a Valid / Expiring Soon / Expired flag per permit) as a CSV you can hand to regulators or auditors.' },
        ]},
      ],
    },
    {
      id: 'obligations-permits',
      title: 'Obligations & Permits',
      description: 'Maintain the environmental permit register.',
      content: [
        { type: 'paragraph', text: 'The Permit Register lists every environmental permit with its authority, expiry date and status. Use the row menu (⋯) on any permit to edit or delete it.' },
        { type: 'step-list', items: [
          { title: 'Click "Add Permit"', description: 'Top-right of the Permit Register.' },
          { title: 'Enter the details', description: 'Permit number and type are required; add the issuing authority, issue/expiry dates and status as available.' },
          { title: 'Save', description: 'The permit appears in the register and feeds the dashboard\'s "permits due" count and the compliance pack.' },
        ]},
        { type: 'alert', variant: 'info', title: 'Editing & deleting', text: 'Every row has a ⋯ menu with Edit and Delete (delete asks for confirmation). The same pattern is used across the Spills, Waste and Monitoring tabs.' },
      ],
    },
    {
      id: 'studies-emp',
      title: 'Studies & EMP',
      description: 'Environmental studies and Environmental Management Plan actions.',
      content: [
        { type: 'paragraph', text: 'This tab has two parts. The Studies Register tracks cyclical studies (e.g. EIA/EER) with their cycle length, last-conducted and next-due dates, and a status that turns red when a study is overdue.' },
        { type: 'paragraph', text: 'Below it, the EMP Actions list shows the management-plan commitments with their responsible person, due date and open/closed status.' },
      ],
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      description: 'Record environmental samples and compare them to limits.',
      content: [
        { type: 'paragraph', text: 'The Monitoring tab lists sample results (parameter, value, unit, limit, location, date) with a compliance status. When you enter a sample, the status is set automatically: at or below the limit is "Compliant", above it is "Exceedance".' },
        { type: 'step-list', items: [
          { title: 'Click "New Sample"', description: 'Or use "Submit Monitoring Data" from the dashboard Quick Actions.' },
          { title: 'Enter the reading', description: 'Parameter, value, unit and sample date are required; add the limit and location to enable the automatic compliance check.' },
          { title: 'Save', description: 'The sample is added with its computed status. Use the row ⋯ menu to edit or delete later.' },
        ]},
      ],
    },
    {
      id: 'emissions-flaring',
      title: 'Emissions & Flaring',
      description: 'Track flaring and emissions volumes.',
      content: [
        { type: 'paragraph', text: 'Record flaring/emissions logs over time. Total flaring volume rolls up onto the dashboard so you can watch the trend.' },
      ],
    },
    {
      id: 'waste',
      title: 'Waste & Chemicals',
      description: 'Cradle-to-grave waste manifest tracking.',
      content: [
        { type: 'paragraph', text: 'The Waste Manifests table tracks each waste stream from generation to disposal: manifest number, waste type, quantity, classification (Non-Hazardous / Hazardous / Recyclable), transporter, disposal facility and status.' },
        { type: 'step-list', items: [
          { title: 'Click "New Manifest"', description: 'Top-right of the Waste Manifests table.' },
          { title: 'Enter the waste details', description: 'Manifest number, waste type and quantity are required; add classification, transporter, disposal facility and disposal date.' },
          { title: 'Save and track', description: 'Update the status as the waste moves to disposal; edit/delete via the row ⋯ menu.' },
        ]},
      ],
    },
    {
      id: 'spills',
      title: 'Spills',
      description: 'Report and manage spill incidents.',
      content: [
        { type: 'paragraph', text: 'The Spill Incident Register captures each spill with its substance, severity, volume spilled/recovered, location, status and remediation plan.' },
        { type: 'step-list', items: [
          { title: 'Click "Log New Spill"', description: 'On the Spills tab, or via the dashboard Quick Action.' },
          { title: 'Describe the spill', description: 'A spill ID and incident date are required (an ID is pre-filled). Record the substance, quantity spilled/recovered, severity, location and remediation plan.' },
          { title: 'Save', description: 'The incident is added to the register and counts toward the dashboard spill metric. Edit/delete via the row ⋯ menu as the response progresses.' },
        ]},
        { type: 'alert', variant: 'warning', title: 'Report spills promptly', text: 'Spills often carry regulatory reporting deadlines. Log the incident as soon as it is safe to do so, then keep the status and remediation plan up to date.' },
      ],
    },
    {
      id: 'decommissioning',
      title: 'Decommissioning',
      description: 'Facility closure and lifecycle status.',
      content: [
        { type: 'paragraph', text: 'The Decommissioning tab summarises your facilities by lifecycle status — Operating, Decommissioning, and Decommissioned — with a count of each and a table of facilities (name, type, location and status) so you can track closure planning.' },
      ],
    },
    {
      id: 'reporting',
      title: 'Reporting',
      description: 'Export compliance-ready data.',
      content: [
        { type: 'paragraph', text: 'The Reporting tab is an export centre. Each card shows how many records exist and exports that register to CSV.' },
        { type: 'list', items: [
          'NUPRC Monthly Pack — this calendar month\'s monitoring results',
          'Annual Environmental Report — a consolidated year-to-date view of spills, waste and monitoring',
          'Per-register exports — Permits, Monitoring, Spills, Waste and Studies',
        ]},
        { type: 'alert', variant: 'info', title: 'Empty exports', text: 'If a register has no records yet, the export button tells you there is nothing to export rather than producing an empty file.' },
      ],
    },
  ],
};
