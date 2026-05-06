import { 
  AlertTriangle, ShieldCheck, Users, BarChart3, HardHat, Leaf, 
  CheckCircle2, Smartphone, Clock, DollarSign, FileText, Zap 
} from 'lucide-react';

export const benefitsData = {
  "incident-management": {
    title: "Real-Time Incident Management",
    subtitle: "Turn reactive reporting into proactive prevention.",
    icon: AlertTriangle,
    heroImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replaced with a relevant image
    problem: {
      title: "The Hidden Cost of Delayed Reporting",
      description: "Paper forms and disconnected spreadsheets cause delays that leave your workforce vulnerable. By the time an incident reaches the safety manager's desk, critical evidence is lost and preventative actions are too late.",
      stats: [
        { value: "48h+", label: "Avg. delay in reporting" },
        { value: "40%", label: "Incidents never reported" },
        { value: "$42k", label: "Avg. cost per injury" }
      ]
    },
    solution: {
      title: "Instant Reporting, Immediate Action",
      description: "Empower every worker to report safety issues in seconds using their mobile device. Capture photos, GPS location, and voice notes instantly, triggering automated workflows that notify the right people immediately.",
      steps: [
        "Worker spots hazard or incident",
        "Scans QR code or uses app to report in 30 seconds",
        "Safety manager gets instant push notification",
        "Automated investigation workflow begins"
      ]
    },
    benefits: [
      { title: "Report in Seconds", desc: "Intuitive mobile interface designed for field use.", icon: Clock },
      { title: "100% Compliance", desc: "Mandatory fields ensure no critical data is missed.", icon: CheckCircle2 },
      { title: "Automated Alerts", desc: "Notify supervisors and medical teams instantly.", icon: Zap }
    ],
    features: [
      { title: "Mobile Evidence Capture", desc: "Take photos and record voice notes directly in the app." },
      { title: "Offline Capability", desc: "Report even without internet; syncs automatically when online." },
      { title: "Smart Escalation", desc: "Automatically route serious incidents to senior management." },
      { title: "Root Cause Analysis", desc: "Built-in 5 Whys and Fishbone diagram tools." }
    ],
    useCases: [
      { role: "Field Worker", scenario: "Spots a loose railing. Snaps a photo, tags location, submits in 1 minute. Hazard fixed same day." },
      { role: "Safety Manager", scenario: "Receives immediate alert of a near-miss. Assigns investigation task from mobile dashboard." }
    ],
    faqs: [
      { q: "Does the app work offline?", a: "Yes, fully functional offline. Data syncs when connection is restored." },
      { q: "Can we customize the incident forms?", a: "Absolutely. Our drag-and-drop builder lets you create custom forms for any incident type." }
    ]
  },
  "risk-assessment": {
    title: "Comprehensive Risk Assessment",
    subtitle: "Identify hazards before they become incidents.",
    icon: ShieldCheck,
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "Inconsistent Risk Evaluations",
      description: "Manual risk assessments are often copy-pasted, outdated, or sitting in a dusty binder. Without a standardized, dynamic process, critical risks go unnoticed until an accident happens.",
      stats: [
        { value: "70%", label: "Assessments are generic" },
        { value: "1/5", label: "Workers read RAMS" },
        { value: "Risk", label: "Exposure increases" }
      ]
    },
    solution: {
      title: "Standardized, Dynamic Risk Management",
      description: "Create a digital library of standardized risk assessments that can be easily tailored to specific jobs. Ensure every worker acknowledges risks before starting work with digital signatures.",
      steps: [
        "Select activity from template library",
        "Customize hazards for specific site conditions",
        "Assign controls and responsible persons",
        "Digital sign-off by entire crew"
      ]
    },
    benefits: [
      { title: "Consistent Standards", desc: "Ensure every site uses the same rigorous safety standards.", icon: CheckCircle2 },
      { title: "Live Updates", desc: "Update a risk assessment once, sync it to all active jobs.", icon: Zap },
      { title: "Audit Trail", desc: "Proof of who signed what and when.", icon: FileText }
    ],
    features: [
      { title: "Template Library", desc: "Pre-built templates for common industry activities." },
      { title: "Risk Matrix Configurator", desc: "Customize your risk matrix (3x3, 5x5) to match company policy." },
      { title: "QR Code Access", desc: "Post QR codes at work zones for instant access to relevant RAMS." }
    ],
    useCases: [
      { role: "Supervisor", scenario: "Conducts morning toolbox talk, pulls up digital RAMS, crew signs on tablet." },
      { role: "Auditor", scenario: "Instantly reviews risk assessment history for a specific project to ensure compliance." }
    ],
    faqs: [
      { q: "Can I import my existing Excel assessments?", a: "Yes, our team can help migrate your legacy data into the platform." },
      { q: "Is it legally compliant?", a: "Yes, digital signatures and timestamps provide a robust legal audit trail." }
    ]
  },
  "team-collaboration": {
    title: "Team Collaboration & Compliance",
    subtitle: "Connect your workforce for a safer culture.",
    icon: Users,
    heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "Communication Silos Create Danger",
      description: "When safety information is trapped in emails or paper notice boards, frontline workers miss critical updates. Disconnected teams lead to inconsistent safety practices and increased accident rates.",
      stats: [
        { value: "60%", label: "Workers feel uninformed" },
        { value: "3x", label: "Higher incident rate" },
        { value: "Low", label: "Safety engagement" }
      ]
    },
    solution: {
      title: "One Platform for Everyone",
      description: "Bridge the gap between the boardroom and the frontline. Push safety alerts, share lessons learned, and track training compliance in a single, accessible platform.",
      steps: [
        "Manager publishes safety alert",
        "Notification sent to all relevant staff",
        "Workers acknowledge receipt in app",
        "Dashboard tracks read rates"
      ]
    },
    benefits: [
      { title: "Engaged Workforce", desc: "Give everyone a voice in safety.", icon: Users },
      { title: "Instant Reach", desc: "Reach 100% of your staff in minutes, not days.", icon: Smartphone },
      { title: "Verifiable Compliance", desc: "Know exactly who has completed required training.", icon: CheckCircle2 }
    ],
    features: [
      { title: "Safety Moments", desc: "Library of daily safety topics for team briefings." },
      { title: "Document Management", desc: "Centralized storage for all safety manuals and policies." },
      { title: "Training Tracker", desc: "Automated reminders for expiring certifications." }
    ],
    useCases: [
      { role: "HR Manager", scenario: "Automatically notified when a worker's First Aid cert is expiring in 30 days." },
      { role: "Site Lead", scenario: "Shares a 'Lesson Learned' from a recent near-miss with all sites instantly." }
    ],
    faqs: [
      { q: "Can we manage external contractors?", a: "Yes, the Contractor Management module allows limited access for external partners." }
    ]
  },
  "analytics-reporting": {
    title: "Advanced Analytics & Reporting",
    subtitle: "Turn safety data into actionable insights.",
    icon: BarChart3,
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "Drowning in Data, Starving for Wisdom",
      description: "Collecting safety data is useless if it sits in spreadsheets. Manual reporting takes days of effort, meaning you're always looking at the past instead of predicting the future.",
      stats: [
        { value: "20h", label: "Monthly reporting time" },
        { value: "Lagging", label: "Indicators only" },
        { value: "Blind", label: "To emerging trends" }
      ]
    },
    solution: {
      title: "Real-Time Intelligence",
      description: "Visualize your safety performance instantly. Identify hotspots, track leading indicators like observation rates, and generate board-ready reports with a single click.",
      steps: [
        "Data collected from field activities",
        "Instant aggregation in cloud",
        "Dashboards update in real-time",
        "Auto-generate PDF reports"
      ]
    },
    benefits: [
      { title: "Predictive Safety", desc: "Spot trends before they become incidents.", icon: BarChart3 },
      { title: "Zero Admin Time", desc: "Stop building spreadsheets. Start analyzing.", icon: Clock },
      { title: "Executive Visibility", desc: "Give leadership a clear view of HSE performance.", icon: CheckCircle2 }
    ],
    features: [
      { title: "Custom Dashboards", desc: "Drag-and-drop widgets to track KPIs that matter to you." },
      { title: "Automated Emails", desc: "Schedule weekly performance reports to be sent automatically." },
      { title: "Heatmaps", desc: "Visually identify high-risk times of day or locations." }
    ],
    useCases: [
      { role: "HSE Director", scenario: "Spots a trend of rising hand injuries in Sector B, initiates targeted glove training." },
      { role: "CEO", scenario: "Receives a monthly one-page summary of company safety performance automatically." }
    ],
    faqs: [
      { q: "Can I export the raw data?", a: "Yes, export to CSV, Excel, or PDF at any time." },
      { q: "Is PowerBI integration supported?", a: "Yes, enterprise plans support API access for external BI tools." }
    ]
  },
  "contractor-management": {
    title: "Contractor & Visitor Management",
    subtitle: "Ensure every person on site is compliant and accounted for.",
    icon: HardHat,
    heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "The Compliance Gap",
      description: "Contractors often fall outside standard safety loops. Verifying insurance, training, and inductions manually at the gate creates bottlenecks and leaves liability gaps.",
      stats: [
        { value: "3x", label: "Contractor incident rate" },
        { value: "High", label: "Liability exposure" },
        { value: "Slow", label: "Site access time" }
      ]
    },
    solution: {
      title: "Digital Gatekeeping",
      description: "Pre-qualify contractors before they arrive. Digital inductions, document uploads, and QR code check-ins ensure only compliant workers enter your site.",
      steps: [
        "Contractor uploads docs online",
        "Safety team approves pre-qualification",
        "Worker completes online induction",
        "QR code issued for site access"
      ]
    },
    benefits: [
      { title: "Reduced Liability", desc: "Ensure valid insurance and training before work starts.", icon: ShieldCheck },
      { title: "Faster Onboarding", desc: "Inductions completed before arrival.", icon: Clock },
      { title: "Real-Time Muster", desc: "Know exactly who is on site instantly.", icon: Users }
    ],
    features: [
      { title: "Document Expiry Alerts", desc: "Auto-notify contractors when insurance needs renewal." },
      { title: "Digital Inductions", desc: "Video-based inductions with quizzes." },
      { title: "Visitor Kiosk", desc: "Self-service tablet mode for visitor sign-ins." }
    ],
    useCases: [
      { role: "Security Guard", scenario: "Scans contractor's phone. App confirms induction is valid. Access granted." },
      { role: "Procurement", scenario: "Checks safety rating of potential vendors before awarding contracts." }
    ],
    faqs: [
      { q: "Does this handle visitor badges?", a: "Yes, it can print visitor badges upon successful check-in." }
    ]
  },
  "environmental-compliance": {
    title: "Carbon & Environmental Compliance",
    subtitle: "Manage your environmental footprint with precision.",
    icon: Leaf,
    heroImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "Regulatory Complexity",
      description: "Tracking waste streams, emissions, and spill incidents across multiple sites is a logistical nightmare. Missed reporting deadlines can lead to massive fines and reputational damage.",
      stats: [
        { value: "$$$", label: "Potential EPA fines" },
        { value: "Complex", label: "Reporting standards" },
        { value: "Manual", label: "Data collection" }
      ]
    },
    solution: {
      title: "Simplified Sustainability",
      description: "Centralize your environmental data. Track waste manifests, calculate carbon emissions, and manage spill response protocols in one compliant system.",
      steps: [
        "Log waste transfer notes digitally",
        "Track fuel usage for auto-carbon calcs",
        "Manage permit expiry dates",
        "Generate regulatory reports"
      ]
    },
    benefits: [
      { title: "Avoid Fines", desc: "Never miss a permit renewal or reporting deadline.", icon: DollarSign },
      { title: "ESG Ready", desc: "Data structured for sustainability reporting.", icon: Leaf },
      { title: "Quick Response", desc: "Instant access to spill response plans.", icon: Zap }
    ],
    features: [
      { title: "Carbon Calculator", desc: "Convert fuel/energy usage to CO2e automatically." },
      { title: "Waste Manifesting", desc: "Digital tracking of hazardous waste from generation to disposal." },
      { title: "Spill Reporting", desc: "Specialized workflows for environmental incidents." }
    ],
    useCases: [
      { role: "Env Manager", scenario: "Receives alert that a discharge permit expires in 60 days. Starts renewal." },
      { role: "Site Admin", scenario: "Logs diesel usage weekly; dashboard updates corporate carbon footprint instantly." }
    ],
    faqs: [
      { q: "Does it support Scope 1, 2 & 3?", a: "Yes, built-in calculators help categorize emissions correctly." }
    ]
  }
};