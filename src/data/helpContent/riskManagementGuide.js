import { AlertTriangle } from 'lucide-react';

export const riskManagementGuide = {
  id: 'risk',
  title: 'Risk Management Guide',
  icon: AlertTriangle,
  description: 'Register, assess, treat, monitor and forecast enterprise risk across ten linked tabs.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'How the Enterprise Risk Management module is organised.',
      content: [
        { type: 'paragraph', text: 'The Risk module follows the standard risk lifecycle — identify, assess, treat, monitor, report — across a row of tabs. All data is scoped to your organization.' },
        { type: 'list', items: [
          'Dashboard — risk counts, average score and a heat map',
          'Risk Register — the master list of risks',
          'Assessment — likelihood × impact scoring',
          'Mitigation — the treatment action plan',
          'Monitoring & Control — Key Risk Indicators (KRIs)',
          'Reporting — summaries with CSV/print export',
          'Analytics — charts and the exposure heat map',
          'Appetite & Tolerance — per-category tolerance vs. live exposure',
          'Scenario Planning — what-if financial exposure modelling',
          'Culture & Training — risk-process maturity and training',
        ]},
      ],
    },
    {
      id: 'register',
      title: 'Risk Register',
      description: 'The central, live list of all identified risks.',
      content: [
        { type: 'paragraph', text: 'Every risk lives here with its ID, title, category, score, status and owner. Search by keyword, page through results, and export the whole register to CSV from the toolbar.' },
        { type: 'step-list', items: [
          { title: 'Click "Add Risk"', description: 'Opens the risk form.' },
          { title: 'Describe the risk', description: 'Give it a title and category, then set Likelihood (1-5) and Impact (1-5) — the score and rating are calculated live as you choose.' },
          { title: 'Add context', description: 'Record the root cause and potential consequences. You are set as the initial owner.' },
          { title: 'Submit', description: 'The risk joins the register. Use the row ⋯ menu to Edit or Delete it later.' },
        ]},
        { type: 'alert', variant: 'info', title: 'Export', text: 'The "Export" button downloads the current register (including each risk\'s rating, owner and mitigation count) as a CSV.' },
      ],
    },
    {
      id: 'assessment',
      title: 'Assessment & the 5×5 Matrix',
      description: 'How risks are scored.',
      content: [
        { type: 'paragraph', text: 'Petrolord uses a standard 5×5 matrix mapping Likelihood against Impact; the score is Likelihood × Impact (1-25) and sets the rating:' },
        { type: 'list', items: [
          'Low (1-4): acceptable — monitor.',
          'Medium (5-9): manage to ALARP (As Low As Reasonably Practicable).',
          'High (10-14): requires a mitigation plan.',
          'Critical (15-25): urgent treatment required.',
        ]},
        { type: 'paragraph', text: 'Re-scoring a risk (changing likelihood or impact) automatically recalculates its rating.' },
      ],
    },
    {
      id: 'mitigation',
      title: 'Mitigation',
      description: 'The treatment action plan across all risks.',
      content: [
        { type: 'paragraph', text: 'The Mitigation tab consolidates the treatment actions for every risk, with KPI tiles for total / in-progress / completed / overdue actions. Each action shows its parent risk, strategy, due date and a progress bar.' },
        { type: 'step-list', items: [
          { title: 'Click "Add Action"', description: 'Pick the risk it treats.' },
          { title: 'Define the action', description: 'Describe what will be done and choose a strategy — Avoid, Reduce, Transfer or Accept — plus due date, progress and budget.' },
          { title: 'Track to completion', description: 'Update status inline from the table (marking it Completed sets progress to 100%); edit or delete via the row ⋯ menu.' },
        ]},
      ],
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Control (KRIs)',
      description: 'Early-warning indicators for your risks.',
      content: [
        { type: 'paragraph', text: 'Key Risk Indicators are shown as cards with the current value plotted against warning and critical thresholds. Each card is flagged Normal, Warning or Critical, and the KPI strip totals how many KRIs are in each state so breaches stand out.' },
      ],
    },
    {
      id: 'reporting',
      title: 'Reporting',
      description: 'Board-ready summaries you can export.',
      content: [
        { type: 'paragraph', text: 'The Reporting tab summarises totals, critical count, average score and breakdowns by category and status, alongside the full register detail. Export the register to CSV, or use Print for a PDF.' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Visual analysis of your risk profile.',
      content: [
        { type: 'paragraph', text: 'Analytics renders a 5×5 exposure heat map plus charts: severity distribution (pie) and risks by category and by status (bars) — all computed live from the register.' },
      ],
    },
    {
      id: 'appetite',
      title: 'Appetite & Tolerance',
      description: 'Are you operating within your risk appetite?',
      content: [
        { type: 'paragraph', text: 'For each category, this tab compares your defined tolerance (a maximum acceptable score) against your live exposure (the highest current risk score in that category). Categories over their tolerance are flagged "Over Appetite" so leadership can see where exposure exceeds the agreed limit.' },
        { type: 'alert', variant: 'info', title: 'Where the numbers come from', text: 'Tolerance thresholds are framework defaults; current exposure is calculated live from the risk register.' },
      ],
    },
    {
      id: 'scenario',
      title: 'Scenario Planning',
      description: 'Model the financial exposure of what-if events.',
      content: [
        { type: 'paragraph', text: 'Add hypothetical scenarios with a type, qualitative probability and a financial impact. The tab computes a probability-weighted "expected exposure" across all scenarios so you can compare and prioritise.' },
        { type: 'step-list', items: [
          { title: 'Click "Add Scenario"', description: 'Give it a title and description.' },
          { title: 'Set the parameters', description: 'Choose a type, a probability (Rare → Almost Certain) and the estimated financial impact.' },
          { title: 'Review the model', description: 'Each scenario shows its weighted expected loss; the KPIs roll up total and expected exposure. Edit/delete via the row ⋯ menu.' },
        ]},
      ],
    },
    {
      id: 'culture',
      title: 'Culture & Training',
      description: 'Risk-process maturity and training engagement.',
      content: [
        { type: 'paragraph', text: 'This tab combines training KPIs (active programs, upcoming sessions, completed trainings, qualified personnel) with two risk-process maturity indicators computed live from the register: the share of risks with an assigned owner, and the share with at least one mitigation action. Together they show how actively the organisation is owning and treating its risks.' },
      ],
    },
  ],
};
