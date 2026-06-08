import { ListTodo, Layers, LayoutList, Filter, BarChart2, ClipboardCheck, MessageSquare, FileText, CheckCircle, HelpCircle } from 'lucide-react';

export const actionTrackerGuide = {
  id: 'actions',
  title: 'Action Tracker Guide',
  icon: ListTodo,
  description: 'Track corrective and preventive actions from assignment through to verified closure.',
  sections: [
    {
      id: 'overview',
      title: 'Module Overview',
      icon: Layers,
      description: 'Understanding the Action Tracker',
      content: [
        { type: 'paragraph', text: 'The Action Tracker is the central place to manage corrective and preventive actions across your organization. Actions are tasks that someone must complete to fix a problem or prevent recurrence, and many of them originate from incidents, inspections, and other reports elsewhere in the HSE suite.' },
        { type: 'paragraph', text: 'Every action carries a unique action code, a title and description, a priority, an assignee, and a due date. As work progresses it moves through a clear set of statuses so everyone can see where it stands.' },
        { type: 'alert', variant: 'info', title: 'Why it matters', text: 'Actions that are raised but never closed are the most common gap in any safety system. The Action Tracker keeps every commitment visible until it is genuinely complete and approved.' },
        { type: 'paragraph', text: 'The module gives you:' },
        { type: 'list', items: [
          'A searchable List view of all actions.',
          'An Aging view showing how long open actions have been outstanding.',
          'Stats cards summarizing the count of actions in each status.',
          'Sidebar filters and quick-filter buttons to narrow the list.',
          'A detail panel for updating progress, adding comments and evidence, and moving an action to closure.'
        ]}
      ]
    },
    {
      id: 'statuses',
      title: 'Action Statuses & Stats',
      icon: BarChart2,
      description: 'The lifecycle stages an action moves through.',
      content: [
        { type: 'paragraph', text: 'Every action sits in one of four statuses. The five stats cards across the top of the module show the live count of actions in each status, plus a grand total.' },
        { type: 'step-list', items: [
          { title: 'Total Actions', description: 'The total number of actions currently loaded, regardless of status.' },
          { title: 'Open', description: 'Newly raised actions that have not yet been started.' },
          { title: 'In Progress', description: 'Actions that the assignee has started working on.' },
          { title: 'Pending Approval', description: 'Work has been completed and submitted, and is now awaiting review and sign-off.' },
          { title: 'Closed', description: 'Actions that have been approved and verified as complete.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Priority levels', text: 'Each action also has a priority of Low, Medium, High, or Critical, which helps you decide what to tackle first.' }
      ]
    },
    {
      id: 'views',
      title: 'Views: List & Aging',
      icon: LayoutList,
      description: 'Two ways to look at your actions.',
      content: [
        { type: 'paragraph', text: 'Use the List and Aging buttons in the module header to switch between the two views. Both views respect the filters and quick filters you have applied.' }
      ],
      subsections: [
        {
          title: 'List View',
          content: [
            { type: 'paragraph', text: 'The List view shows actions as rows you can scan and open. Click an action to open its detail panel on the right, where you can update and work it.' }
          ]
        },
        {
          title: 'Aging View',
          content: [
            { type: 'paragraph', text: 'The Aging view groups all open (not yet closed) actions into age buckets based on how long ago they were created, so you can see where work is piling up.' },
            { type: 'list', items: [
              '0 - 30 Days (green): recently raised actions.',
              '31 - 60 Days (yellow): actions starting to age.',
              '61 - 90 Days (orange): actions that need attention.',
              '90+ Days (red): long-outstanding actions that should be prioritized.'
            ]},
            { type: 'paragraph', text: 'Each bucket shows the number of actions and the percentage of all open actions it represents.' }
          ]
        }
      ]
    },
    {
      id: 'filtering',
      title: 'Filtering & Searching',
      icon: Filter,
      description: 'Narrowing down to the actions you care about.',
      content: [
        { type: 'paragraph', text: 'There are three ways to focus the list: the search box, the sidebar filters, and the quick-filter buttons. They work together, so you can combine them.' }
      ],
      subsections: [
        {
          title: 'Search',
          content: [
            { type: 'paragraph', text: 'The search box in the header matches against an action\'s code, title, and description. Type any of these to instantly narrow the list.' }
          ]
        },
        {
          title: 'Sidebar Filters',
          content: [
            { type: 'paragraph', text: 'The Filters sidebar on the left lets you refine by several criteria. Use the Clear All button at the top of the sidebar to reset everything at once.' },
            { type: 'list', items: [
              'Status: tick any of Open, In Progress, Pending Approval, or Closed (you can select more than one).',
              'Priority: tick any of Low, Medium, High, or Critical.',
              'Assigned To: choose a specific user, or leave it on All Users.',
              'SLA: tick Overdue Only to show actions that have passed their due date.'
            ]},
            { type: 'alert', variant: 'info', title: 'On smaller screens', text: 'The sidebar filters are shown on larger (desktop) screens. The search box and quick filters remain available everywhere.' }
          ]
        },
        {
          title: 'Quick Filters',
          content: [
            { type: 'paragraph', text: 'The quick-filter buttons above the list give you one-click shortcuts to the most common views.' },
            { type: 'step-list', items: [
              { title: 'All Actions', description: 'Removes the quick filter and shows everything matching your other filters.' },
              { title: 'My Actions', description: 'Shows only actions assigned to you.' },
              { title: 'Overdue', description: 'Shows actions that are not closed and whose due date has already passed.' },
              { title: 'High Priority', description: 'Shows actions with High or Critical priority.' },
              { title: 'Due This Week', description: 'Shows actions due within the next seven days.' }
            ]}
          ]
        }
      ]
    },
    {
      id: 'working-action',
      title: 'Working an Action to Closure',
      icon: ClipboardCheck,
      description: 'Finding, updating, and closing an assigned action.',
      content: [
        { type: 'paragraph', text: 'When an action is assigned to you, your job is to do the work, record progress and evidence, and move it through the lifecycle to closure. Here is the typical end-to-end flow.' },
        { type: 'step-list', items: [
          { title: 'Find your action', description: 'Click the "My Actions" quick filter to show only the actions assigned to you. You can also use search or the Overdue filter to prioritize.' },
          { title: 'Open the detail panel', description: 'Click the action in the list. A panel slides in from the right showing its code, priority, status, title, due date, and assignee.' },
          { title: 'Start progress', description: 'If the action is Open, click "Start Progress" in the footer to move it to In Progress.' },
          { title: 'Record completion progress', description: 'On the Details tab, drag the Completion Progress slider as you work to keep stakeholders informed of how far along you are.' },
          { title: 'Add evidence', description: 'On the Docs tab, paste a file URL or link to attach supporting documents and evidence of completion.' },
          { title: 'Discuss as needed', description: 'Use the Chat tab to leave comments and ask questions; messages are timestamped and visible to others working the action.' },
          { title: 'Submit for approval', description: 'When the work is done, click "Submit for Approval" in the footer. This moves the action to Pending Approval and marks progress as 100%.' },
          { title: 'Approval and closure', description: 'A reviewer opens the action and either clicks "Reject" (sending it back to Open) or "Approve & Close" to formally close it.' }
        ]},
        { type: 'alert', variant: 'warning', title: 'Closure means verified, not just done', text: 'Submitting for approval is not the same as closing. An action is only Closed once a reviewer has approved it. If it is rejected, address the feedback and submit again.' }
      ]
    },
    {
      id: 'editing-details',
      title: 'Editing Action Details',
      icon: FileText,
      description: 'Changing priority, assignee, and due date.',
      content: [
        { type: 'paragraph', text: 'Some action fields can be changed directly from the detail panel without leaving the tracker.' },
        { type: 'step-list', items: [
          { title: 'Click Edit', description: 'In the top section of the detail panel, click the "Edit" link to reveal the editable fields.' },
          { title: 'Adjust the fields', description: 'Change the Priority, pick a new Due Date from the calendar, and reassign the action to a different user if needed.' },
          { title: 'Save', description: 'Click "Save" to apply your changes, or "Cancel" to discard them.' }
        ]},
        { type: 'paragraph', text: 'If an action was raised from another part of the suite, the detail panel also shows a Source Report link so you can trace it back to its origin. The Timeline tab shows the action\'s approval workflow and history.' }
      ]
    },
    {
      id: 'collaboration',
      title: 'Comments & Documents',
      icon: MessageSquare,
      description: 'Keeping a record of communication and evidence.',
      content: [
        { type: 'paragraph', text: 'Two tabs in the detail panel keep a lasting record on each action:' },
        { type: 'list', items: [
          'Chat: a running thread of timestamped comments. Type a message and send it to keep everyone aligned.',
          'Docs: a list of attached document links. Paste a URL and click Add to record evidence of completion.'
        ]},
        { type: 'alert', variant: 'info', title: 'Good practice', text: 'Always attach evidence and a closing comment before submitting an action for approval. This makes the reviewer\'s job faster and creates a clear audit trail.' }
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: CheckCircle,
      content: [
        { type: 'list', items: [
          'Check "My Actions" regularly so nothing assigned to you slips past its due date.',
          'Use the Aging view to find and clear long-outstanding (90+ day) actions.',
          'Keep the progress slider up to date so managers do not have to chase you for status.',
          'Attach evidence before submitting for approval, not after.',
          'Set realistic due dates and reprioritize High and Critical actions first.'
        ]}
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      content: [
        { type: 'step-list', items: [
          { title: 'Cannot see an action you expected?', description: 'Check the sidebar Status filter and any active quick filter. A Closed action will be hidden unless Closed is ticked, and "My Actions" hides anything not assigned to you. Use Clear All to reset.' },
          { title: 'No actions at all?', description: 'Confirm you have the correct organization selected. If the list is genuinely empty, no actions have been raised yet.' },
          { title: 'Cannot submit for approval?', description: 'The "Submit for Approval" button only appears while the action is In Progress. Start the action first.' },
          { title: 'Need to reopen a closed action?', description: 'Open the action and click "Reopen" in the footer to move it back to Open.' }
        ]}
      ]
    }
  ]
};
