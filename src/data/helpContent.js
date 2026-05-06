import { 
  Shield, Activity, Leaf, AlertTriangle, FileText, 
  BarChart2, Users, Settings, Database, Lock 
} from 'lucide-react';

export const helpCategories = [
  { id: 'getting-started', title: 'Getting Started', icon: 'Rocket', description: 'Everything you need to know to get up and running.' },
  { id: 'modules', title: 'Module Guides', icon: 'LayoutGrid', description: 'Detailed documentation for each application module.' },
  { id: 'workflows', title: 'Features & Workflows', icon: 'GitBranch', description: 'Step-by-step guides for common tasks.' },
  { id: 'faqs', title: 'FAQs', icon: 'HelpCircle', description: 'Answers to frequently asked questions.' },
  { id: 'support', title: 'Support', icon: 'LifeBuoy', description: 'Get help from our team.' }
];

export const moduleGuides = [
  { id: 'health', title: 'Health Module', icon: Activity, color: 'text-red-500', description: 'Manage incidents, occupational health, and medical records.' },
  { id: 'safety', title: 'Safety Module', icon: Shield, color: 'text-orange-500', description: 'Track safety metrics, audits, and compliance.' },
  { id: 'environment', title: 'Environment Module', icon: Leaf, color: 'text-green-500', description: 'Monitor emissions, waste, and environmental impact.' },
  { id: 'risk', title: 'Risk Management', icon: AlertTriangle, color: 'text-amber-500', description: 'Identify, assess, and mitigate operational risks.' },
  { id: 'security', title: 'Security Module', icon: Lock, color: 'text-blue-500', description: 'Access control, surveillance, and security incidents.' },
  { id: 'actions', title: 'Action Tracker', icon: FileText, color: 'text-purple-500', description: 'Centralized tracking for all corrective actions.' },
  { id: 'analytics', title: 'Analytics', icon: BarChart2, color: 'text-cyan-500', description: 'Data visualization and reporting dashboards.' },
  { id: 'admin', title: 'Administration', icon: Settings, color: 'text-gray-500', description: 'User management, roles, and system settings.' }
];

export const faqs = [
  {
    category: 'General',
    questions: [
      { q: 'What is Petrolord HSE?', a: 'Petrolord HSE is a comprehensive Health, Safety, and Environment management platform designed for the energy sector.' },
      { q: 'How do I reset my password?', a: 'Go to the login page and click "Forgot Password". Follow the instructions sent to your email.' }
    ]
  },
  {
    category: 'Modules',
    questions: [
      { q: 'How do I report an incident?', a: 'Navigate to the appropriate module (Health, Safety, etc.) and click the "Report Incident" button in the top right.' },
      { q: 'Can I export reports?', a: 'Yes, most tables and dashboards have an "Export" button allowing PDF or Excel downloads.' }
    ]
  }
];