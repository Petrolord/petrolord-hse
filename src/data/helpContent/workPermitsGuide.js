import { FileText, Layers, LayoutDashboard, ClipboardList, CheckSquare, Settings, PlusCircle, Eye } from 'lucide-react';

export const workPermitsGuide = {
  id: 'work-permits',
  title: 'Work Permits Guide',
  icon: FileText,
  description: 'Create, track, and manage permits to work for high-risk activities.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      icon: Layers,
      description: 'What the Work Permits module does.',
      content: [
        { type: 'paragraph', text: 'The Work Permits module helps you control and monitor high-risk activities by issuing a formal permit to work before a task begins. Each permit captures the work to be done, where and when it happens, the hazards involved, the protective equipment required, and who is responsible for approving it.' },
        { type: 'paragraph', text: 'The module is organized into four tabs along the top of the screen:' },
        { type: 'list', items: [
          'Dashboard - a summary of permit activity and key counts.',
          'All Permits - the searchable list of every permit in your organization.',
          'Approvals - the approval workflow area (in progress).',
          'Templates - reusable permit templates (in progress).'
        ]},
        { type: 'paragraph', text: 'A "New Permit" button is available in the top-right corner from any tab, so you can start a new permit at any time.' },
        { type: 'alert', variant: 'info', title: 'Permit types supported', text: 'You can raise permits for Hot Work, Cold Work, Confined Space, Height Work, Electrical, and Excavation activities.' }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'A quick snapshot of permit activity.',
      content: [
        { type: 'paragraph', text: 'The Dashboard is the default view when you open the module. It shows four summary cards giving you an at-a-glance count of your permits:' },
        { type: 'list', items: [
          'Total Permits - all permits recorded for your organization.',
          'Active Now - permits that are currently in effect.',
          'Pending Approval - permits waiting on a supervisor sign-off.',
          'Expiring Soon - permits approaching their end date that may need attention.'
        ]},
        { type: 'paragraph', text: 'Below the cards are Recent Activity and Compliance Overview panels. These areas are part of the dashboard layout and will populate as more data and reporting becomes available.' }
      ]
    },
    {
      id: 'all-permits',
      title: 'All Permits',
      icon: ClipboardList,
      description: 'Browse, search, and open existing permits.',
      content: [
        { type: 'paragraph', text: 'The All Permits tab lists every permit in your organization. Each entry is shown as a card displaying its permit number (or "DRAFT" if not yet issued), title, status, a short description, location, start date, and the name of the requester. The priority of the permit is shown on the right.' },
        { type: 'paragraph', text: 'Use the search box in the top-right of the header (visible on this tab) to filter permits by text. If no permits exist yet, the list invites you to create your first one.' },
        { type: 'step-list', items: [
          { title: 'Open the All Permits tab', description: 'Select "All Permits" from the tabs at the top of the module.' },
          { title: 'Find the permit', description: 'Scroll the list or type into the "Search permits..." box to narrow it down.' },
          { title: 'Click View', description: 'Press the "View" button on a permit card to open its full details.' }
        ]},
        { type: 'paragraph', text: 'Opening a permit slides out a detail panel from the right showing the permit number and status, location and department, requester and supervisor, the schedule (start and end), identified hazards, required PPE, the risk level, and any emergency procedures. The panel also includes a "Download PDF Report" button for the permit.' }
      ]
    },
    {
      id: 'creating-a-permit',
      title: 'Creating a Permit',
      icon: PlusCircle,
      description: 'The primary action: raising a new permit to work.',
      content: [
        { type: 'paragraph', text: 'Click the "New Permit" button in the top-right corner to open the permit creation form. The form is a guided, three-step wizard with a progress indicator at the top. You can move between steps using the "Back" and "Next" buttons.' },
        { type: 'step-list', items: [
          { title: 'Step 1 - General Information', description: 'Choose the Permit Type and Priority, then enter a Title and a Description of Work, along with the Location and Department. Title and Permit Type are the minimum required to save.' },
          { title: 'Step 2 - Hazards & Controls', description: 'Tick the Identified Hazards that apply (for example Working at Height, Hot Work, Confined Space), select the Required PPE (such as Safety Helmet, Gloves, Full Body Harness), and set the Risk Level Assessment.' },
          { title: 'Step 3 - Schedule & Team', description: 'Set the Start and End date/time, choose the Site Supervisor who will approve the permit, optionally add a Contractor Company, and document Emergency Procedures.' },
          { title: 'Save or Submit', description: 'On the final step, use "Save Draft" to keep working on it later, or "Submit Permit" to send it for approval.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Drafts vs. submissions', text: 'Saving a Draft only requires a Title and Permit Type. Submitting for approval is stricter: it also requires Location, Department, Site Supervisor, Start Date, End Date, and a Description, and the End Date must be after the Start Date.' },
        { type: 'alert', variant: 'warning', title: 'Choose a supervisor before submitting', text: 'The Site Supervisor is the approver for the permit. If no supervisor is selected, the permit cannot be submitted for approval. Make sure the right people exist as users in your organization so they appear in the list.' }
      ]
    },
    {
      id: 'approvals',
      title: 'Approvals',
      icon: CheckSquare,
      description: 'Reviewing and signing off submitted permits.',
      content: [
        { type: 'paragraph', text: 'The Approvals tab is where submitted permits will be reviewed and signed off by the assigned supervisor.' },
        { type: 'alert', variant: 'info', title: 'In progress', text: 'The Approvals section is currently under construction and is being implemented. For now, supervisors are recorded on each permit when it is submitted, but the dedicated approvals workspace is not yet available.' }
      ]
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: Settings,
      description: 'Reusable permit templates.',
      content: [
        { type: 'paragraph', text: 'The Templates tab is intended to let you define reusable permit templates so common jobs can be raised quickly with pre-filled hazards, PPE, and other details.' },
        { type: 'alert', variant: 'info', title: 'In progress', text: 'The Templates section is currently under construction and is being implemented. Until it ships, create each permit directly using the three-step New Permit form.' }
      ]
    }
  ]
};
