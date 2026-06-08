import { HelpCircle } from 'lucide-react';

export const troubleshootingGuide = {
  id: 'troubleshooting',
  title: 'Troubleshooting Guide',
  icon: HelpCircle,
  description: 'Fixes for the most common issues — login, missing modules, empty data, AI features and exports.',
  sections: [
    {
      id: 'login',
      title: 'Login Issues',
      description: 'Can’t sign in or stuck in a login loop.',
      content: [
        { type: 'step-list', items: [
          { title: 'Check your connection', description: 'Make sure you have a working internet connection.' },
          { title: 'Reset your password', description: 'Use "Forgot Password" on the login page if your credentials are rejected.' },
          { title: 'Clear cache / try incognito', description: 'A stale session cookie can cause a login loop. Clear cookies for the site or open a private window.' },
          { title: 'Confirm your invite', description: 'If you have never logged in, check your email for the invitation and complete acceptance first.' },
        ]},
      ],
    },
    {
      id: 'missing-modules',
      title: "I Can't See a Module or Feature",
      description: 'A tab or sidebar item you expected is missing.',
      content: [
        { type: 'paragraph', text: 'The navigation is role-based — you only see the modules your role grants. For example, the Environment module is visible to admins, managers and the Environment Officer; Safety Audits to admins, managers and Auditors.' },
        { type: 'step-list', items: [
          { title: 'Check your role', description: 'Your role is set by your organization admin.' },
          { title: 'Ask an admin to adjust it', description: 'An admin can change your role under Members (Team & Members guide).' },
          { title: 'Confirm you are in the right organization', description: 'If you belong to more than one org, make sure the correct one is active.' },
        ]},
      ],
    },
    {
      id: 'no-data',
      title: 'Dashboards or Tables Are Empty',
      description: 'You see "--", "0", or "No records".',
      content: [
        { type: 'paragraph', text: 'The app shows "--" or an empty state when there is genuinely no data yet, rather than inventing numbers. This is normal for a new organization or module.' },
        { type: 'list', items: [
          'Add some records first (e.g. file a Quick Report, add a permit or a risk) — metrics populate from real data.',
          'Clear any active filters or widen the date range; a narrow filter can hide everything.',
          'Refresh the page if you just added data in another tab.',
        ]},
      ],
    },
    {
      id: 'ai-features',
      title: 'AI Features Not Working',
      description: 'Quick Report AI analysis or the AI Safety Forecast fails.',
      content: [
        { type: 'paragraph', text: 'The photo/voice analysis in Quick Report and the AI Safety Predictor both rely on an AI service that your administrator configures. If it is unavailable you will see a clear message rather than a crash.' },
        { type: 'step-list', items: [
          { title: 'Quick Report still works', description: 'If AI analysis fails, you can still fill in and submit the report manually — nothing is lost.' },
          { title: 'Forecast shows an error', description: 'If "Generate Forecast" reports the service is unavailable, the AI service has not been set up yet. Ask your administrator to confirm it is configured.' },
          { title: 'Sparse forecasts', description: 'If forecasts are thin or low-confidence, there is simply not enough report history yet — keep reporting (especially near misses).' },
        ]},
        { type: 'alert', variant: 'info', title: 'For administrators', text: 'AI features require the organization’s AI service key to be configured on the backend. Contact Petrolord support if you are unsure whether it is set up.' },
      ],
    },
    {
      id: 'exports',
      title: 'Exports & Printing',
      description: 'A CSV doesn’t download or a print/PDF doesn’t open.',
      content: [
        { type: 'list', items: [
          'If nothing downloads, check that your browser isn’t blocking downloads or pop-ups for this site.',
          'If an export says there is nothing to export, the register is empty — add records first.',
          'For Print/PDF, use your browser’s print dialog and choose "Save as PDF".',
        ]},
      ],
    },
    {
      id: 'performance',
      title: 'Slow, Stale, or Glitchy Pages',
      description: 'Data looks out of date or the page misbehaves.',
      content: [
        { type: 'step-list', items: [
          { title: 'Refresh the page', description: 'This re-fetches the latest data.' },
          { title: 'Use a current browser', description: 'Use an up-to-date Chrome, Edge or Firefox for best results.' },
          { title: 'Clear cache', description: 'If something looks broken after an update, a hard refresh / cache clear usually resolves it.' },
        ]},
      ],
    },
    {
      id: 'still-stuck',
      title: 'Still Stuck?',
      content: [
        { type: 'paragraph', text: 'If a problem persists, open the Support tab in the Help Center and submit a ticket describing what you did, what you expected, and what happened. Include screenshots where possible.' },
      ],
    },
  ],
};
