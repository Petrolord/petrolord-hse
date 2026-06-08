import {
  Activity, Leaf, AlertTriangle, FileText,
  BarChart2, Users, Lock, Camera
} from 'lucide-react';

export const helpCategories = [
  { id: 'getting-started', title: 'Getting Started', icon: 'Rocket', description: 'Everything you need to know to get up and running.' },
  { id: 'modules', title: 'Module Guides', icon: 'LayoutGrid', description: 'Detailed documentation for each application module.' },
  { id: 'workflows', title: 'Features & Workflows', icon: 'GitBranch', description: 'Step-by-step guides for common tasks.' },
  { id: 'faqs', title: 'FAQs', icon: 'HelpCircle', description: 'Answers to frequently asked questions.' },
  { id: 'support', title: 'Support', icon: 'LifeBuoy', description: 'Get help from our team.' }
];

export const moduleGuides = [
  { id: 'quick-report', title: 'Quick Report', icon: Camera, color: 'text-orange-500', description: 'File a hazard or near-miss report in seconds with photo + voice AI.' },
  { id: 'health', title: 'Health Module', icon: Activity, color: 'text-red-500', description: 'Manage occupational health, fire safety, and medical records.' },
  { id: 'environment', title: 'Environment Module', icon: Leaf, color: 'text-green-500', description: 'Permits, monitoring, emissions, waste, spills, and reporting.' },
  { id: 'risk', title: 'Risk Management', icon: AlertTriangle, color: 'text-amber-500', description: 'Identify, assess, treat, monitor, and forecast operational risk.' },
  { id: 'security', title: 'Security Module', icon: Lock, color: 'text-blue-500', description: 'Access control, threats, and security incidents.' },
  { id: 'actions', title: 'Action Tracker', icon: FileText, color: 'text-purple-500', description: 'Centralized tracking for all corrective actions.' },
  { id: 'analytics', title: 'AI Safety Predictor', icon: BarChart2, color: 'text-cyan-500', description: 'Forecast likely incidents from your submitted reports.' },
  { id: 'team', title: 'Team & Members', icon: Users, color: 'text-pink-500', description: 'Invite members, assign roles, and manage access.' }
];

export const faqs = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'What is Petrolord HSE?', a: 'Petrolord HSE is a comprehensive Health, Safety, Security and Environment management platform for the energy sector. It centralises reporting, permits, audits, training, risk and analytics in one place.' },
      { q: 'Why do I only see some modules in the sidebar?', a: 'The navigation is role-based — you only see the modules your role grants. For example, only the Environment Officer (and admins/managers) see the Environment module. An org admin can adjust your role under Members.' },
      { q: 'How do I reset my password?', a: 'On the login page click "Forgot Password" and follow the link emailed to you.' }
    ]
  },
  {
    category: 'Reporting',
    questions: [
      { q: 'How do I report a hazard or incident?', a: 'Use Quick Report: capture a photo and/or a voice note, let the AI suggest the category, severity and description, review it, and submit. See the Quick Report guide under Module Guides.' },
      { q: 'Do I need both a photo and a voice note?', a: 'No — either one works. The AI uses whatever you provide. A clear photo plus a short spoken description gives the best result.' },
      { q: 'Where do my submitted reports go?', a: 'They appear under My Reports where you can track status, and in the Supervisor View where supervisors investigate, assign and resolve them.' },
      { q: 'Should I report near misses?', a: 'Yes. Near misses are the strongest early warning of future incidents and they directly improve the AI Safety Predictor\'s forecasts.' },
      { q: 'Can I export reports and registers?', a: 'Yes. Most registers and dashboards have an Export button that produces a CSV; some reports also offer Print (PDF).' }
    ]
  },
  {
    category: 'AI Safety Predictor',
    questions: [
      { q: 'What does the AI Safety Predictor do?', a: 'It analyses your organisation\'s submitted reports, behaviours, incidents and trends to forecast the incidents most likely to occur in the next 30 days, with preventive actions for each.' },
      { q: 'How do I generate a forecast?', a: 'Open the AI Safety Predictor on the Dashboard, go to the AI Forecast tab, and click Generate Forecast. Regenerate any time as new reports come in.' },
      { q: 'How accurate is it, and does it improve?', a: 'Each prediction is later scored against what actually happened; the resulting hit rate is shown next to the Generate button and is fed back into future forecasts. The more your team reports, the sharper it gets.' }
    ]
  },
  {
    category: 'Account & Roles',
    questions: [
      { q: 'How do I invite a team member?', a: 'Admins and managers go to Members, enter the person\'s email and role, and send the invite. See the Team & Members guide.' },
      { q: 'What do roles control?', a: 'A role determines which modules and actions a user can access (e.g. Auditor sees Safety Audits, Risk Officer sees Risk Management). Owners and admins have the broadest access.' }
    ]
  }
];
