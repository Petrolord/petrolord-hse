import { 
  FileText, AlertTriangle, MapPin, Users, Paperclip, Mail, Palette, 
  BarChart2, Zap, ShieldCheck, Share2, HelpCircle, Lock, Server 
} from 'lucide-react';

export const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    description: 'Essential safety tools for every staff member.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      'Unlimited Users (All Staff)',
      '5 Reports / Month',
      '10 Incidents / Month',
      '3 Sites (10 Locs/Site)',
      '100MB Storage',
      'Basic Dashboard',
      'No Email Sending'
    ],
    highlight: false,
    specialBadge: 'Perfect for trying out',
    cta: 'Start Free',
    href: '/signup'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For organizations needing compliance, emails & insights.',
    // Prices handled dynamically in component
    features: [
      'Unlimited Reports & Incidents',
      'Unlimited Sites & Locations',
      '1,000 Emails / Month',
      '100GB Storage',
      'Custom Branding',
      '24/7 Priority Support'
    ],
    highlight: true,
    cta: 'Choose Plan',
    href: '/signup?plan=pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-scale HSSE operating system for large ops.',
    priceMonthly: 'Custom',
    priceAnnual: 'Custom',
    features: [
      '5,000+ Users',
      'Unlimited Everything',
      'Full White-Labeling',
      'Dedicated Account Manager',
      'Advanced Security & SSO',
      'SLA Guarantee'
    ],
    highlight: false,
    cta: 'Contact Sales',
    href: '/contact'
  }
];

export const professionalPricing = [
  { label: "1-10", monthly: 110, annual: 99, savings: "10%" },
  { label: "11-50", monthly: 275, annual: 249, savings: "10%" },
  { label: "51-100", monthly: 555, annual: 499, savings: "10%" },
  { label: "101-250", monthly: 999, annual: 899, savings: "10%" },
  { label: "251-500", monthly: 1665, annual: 1499, savings: "10%" },
  { label: "501-1,000", monthly: 2775, annual: 2499, savings: "10%" },
  { label: "1,001-2,500", monthly: 4999, annual: 4499, savings: "10%" },
  { label: "2,501-5,000", monthly: 8330, annual: 7499, savings: "10%" }
];

export const featureCategories = [
  {
    id: 'core_reporting',
    title: 'Core Reporting',
    icon: FileText,
    features: [
      { name: 'Report Creation', free: '5/month', pro: 'Unlimited', ent: 'Unlimited' },
      { name: 'Templates', free: '1 Template', pro: '10+ Templates', ent: 'Custom Templates' },
      { name: 'Scheduling & Automation', free: false, pro: true, ent: 'Advanced' },
      { name: 'Export (PDF, Excel)', free: 'PDF only', pro: true, ent: true },
      { name: 'Analytics & Insights', free: false, pro: true, ent: 'Real-time' },
    ]
  },
  {
    id: 'incident_hazard',
    title: 'Incident & Hazard',
    icon: AlertTriangle,
    features: [
      { name: 'Incident Reporting', free: '10/month', pro: 'Unlimited', ent: 'Unlimited' },
      { name: 'Risk Matrix & Assessment', free: false, pro: true, ent: true },
      { name: 'Root Cause Analysis', free: false, pro: true, ent: true },
      { name: 'Corrective Actions', free: false, pro: true, ent: 'Custom Workflows' },
      { name: 'Compliance Mapping', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'site_location',
    title: 'Site & Location',
    icon: MapPin,
    features: [
      { name: 'Sites Managed', free: '3 Sites', pro: 'Unlimited', ent: 'Unlimited' },
      { name: 'Map Features', free: 'Basic', pro: 'Full Interactive', ent: 'Advanced' },
      { name: 'Bulk Import', free: false, pro: true, ent: true },
      { name: 'Geolocation Support', free: true, pro: true, ent: true },
    ]
  },
  {
    id: 'user_management',
    title: 'User Management',
    icon: Users,
    features: [
      { name: 'User Limit', free: 'Unlimited', pro: 'Unlimited (Tiered)', ent: '5,000+' },
      { name: 'Roles & Permissions', free: 'Basic', pro: 'Advanced', ent: 'Custom RBAC' },
      { name: 'SSO & SAML', free: false, pro: false, ent: true },
      { name: 'MFA', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'media',
    title: 'Media & Attachments',
    icon: Paperclip,
    features: [
      { name: 'Storage Limit', free: '100MB', pro: '100GB/tier', ent: 'Unlimited' },
      { name: 'Video Uploads', free: false, pro: true, ent: '4K Support' },
      { name: 'Max File Size', free: '5MB', pro: '50MB+', ent: 'Unlimited' },
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Mail,
    features: [
      { name: 'Email Alerts', free: 'No Sending', pro: 'Scheduled', ent: 'Advanced' },
      { name: 'Monthly Email Limit', free: '0', pro: '1,000', ent: 'Unlimited' },
      { name: 'SMS Notifications', free: false, pro: false, ent: true },
    ]
  },
  {
    id: 'branding',
    title: 'Customization',
    icon: Palette,
    features: [
      { name: 'Branding', free: 'Petrolord', pro: 'Logo & Colors', ent: 'Full White-Label' },
      { name: 'Custom Domain', free: false, pro: false, ent: true },
      { name: 'Custom Reports', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart2,
    features: [
      { name: 'Dashboard', free: 'Basic', pro: 'Advanced', ent: 'Predictive' },
      { name: 'Trend Analysis', free: false, pro: true, ent: true },
      { name: 'KPI Tracking', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'integrations',
    title: 'API & Integrations',
    icon: Zap,
    features: [
      { name: 'REST API', free: false, pro: '100 calls/day', ent: 'Unlimited' },
      { name: 'Webhooks', free: false, pro: true, ent: true },
      { name: 'Zapier', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: ShieldCheck,
    features: [
      { name: 'Audit Logs', free: '30 Days', pro: '1 Year', ent: '7 Years' },
      { name: 'Compliance Reports', free: false, pro: true, ent: true },
      { name: 'GDPR Compliance', free: true, pro: true, ent: true },
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Share2,
    features: [
      { name: 'Comments', free: true, pro: true, ent: true },
      { name: 'Task Assignment', free: false, pro: true, ent: true },
      { name: 'Approval Workflows', free: false, pro: true, ent: 'Custom Chains' },
    ]
  },
  {
    id: 'support',
    title: 'Support',
    icon: HelpCircle,
    features: [
      { name: 'Support Channel', free: 'Community', pro: 'Email & Chat', ent: 'Phone & Dedicated' },
      { name: 'Onboarding', free: 'Self-Serve', pro: 'Standard', ent: 'Dedicated Mgr' },
      { name: 'SLA', free: false, pro: false, ent: '99.9%' },
    ]
  },
  {
    id: 'security',
    title: 'Security',
    icon: Lock,
    features: [
      { name: 'Encryption', free: 'Basic', pro: 'Full', ent: 'Advanced' },
      { name: 'IP Whitelisting', free: false, pro: true, ent: true },
      { name: 'Disaster Recovery', free: false, pro: true, ent: true },
    ]
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    icon: Server,
    features: [
      { name: 'Uptime', free: '99%', pro: '99.5%', ent: '99.9%' },
      { name: 'Hosting', free: 'Shared', pro: 'Optimized', ent: 'Dedicated' },
    ]
  }
];

export const faqs = [
  {
    question: "Is the Free tier really free forever?",
    answer: "Yes! The Free tier is designed for broad adoption. It has no time limit, though it comes with usage caps on reports, storage, and emails."
  },
  {
    question: "Can I upgrade or downgrade at any time?",
    answer: "Absolutely. You can move between tiers as your organization grows. Changes to higher tiers are immediate, while downgrades take effect at the end of your billing cycle."
  },
  {
    question: "How does the user count for Professional pricing work?",
    answer: "The Professional tier is priced in bands (e.g., 1-10 users, 11-50 users). You select the band that fits your team size. If you exceed the band, you'll simply move to the next one."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, Amex) for Professional plans. Enterprise plans can be paid via invoice/wire transfer."
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer: "Yes, we offer special pricing for registered non-profits and educational institutions. Please contact our sales team for details."
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "We keep your data for 30 days after cancellation in case you change your mind. After that, it is permanently deleted in accordance with our data retention policy. You can export your data before cancelling."
  }
];