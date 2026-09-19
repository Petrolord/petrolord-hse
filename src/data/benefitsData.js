import { 
  AlertTriangle, ShieldCheck, Users, BarChart3, HardHat, Leaf, 
  CheckCircle2, Smartphone, Clock, DollarSign, FileText, Zap 
} from 'lucide-react';

export const benefitsData = {
  "incident-management": {
    title: "Incident Management",
    subtitle: "Turn reactive reporting into proactive prevention.",
    icon: AlertTriangle,
    heroImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    problem: {
      title: "The Hidden Cost of Delayed Reporting",
      description: "Paper forms and disconnected spreadsheets cause delays that leave your workforce vulnerable. By the time an incident reaches the safety manager's desk, critical evidence is lost and preventative actions are too late.",
      stats: [
        { value: "Delayed", label: "Paper-based reporting" },
        { value: "Lost", label: "Evidence and context" },
        { value: "Late", label: "Preventive actions" }
      ]
    },
    solution: {
      title: "Fast Reporting, Clear Follow-Up",
      description: "Let every worker report safety issues from a phone. Capture photos, video and voice notes, let AI draft the report from what was captured, and give supervisors one place to assign and investigate.",
      steps: [
        "Worker spots a hazard or incident",
        "Reports it in the app, or scans a site QR code to report without an account",
        "Supervisor assigns it for investigation",
        "Root cause recorded with a 5 Whys analysis"
      ]
    },
    benefits: [
      { title: "Report in Seconds", desc: "Mobile-first reporting designed for field use.", icon: Clock },
      { title: "Complete Records", desc: "Photos, voice notes and severity captured with each report.", icon: CheckCircle2 },
      { title: "Clear Ownership", desc: "Each report can be assigned to a named investigator.", icon: Zap }
    ],
    features: [
      { title: "Mobile Evidence Capture", desc: "Take photos and record voice notes directly in the app." },
      { title: "AI-Assisted Reports", desc: "AI drafts the report from your photos and voice notes for you to review." },
      { title: "Site QR Reporting", desc: "Post a QR code at each site so anyone on site can report an observation." },
      { title: "Root Cause Analysis", desc: "Built-in 5 Whys investigation." }
    ],
    useCases: [
      { role: "Field Worker", scenario: "Spots a loose railing, takes a photo and submits a report from the site." },
      { role: "Safety Manager", scenario: "Reviews new reports on the supervisor dashboard and assigns an investigation." }
    ],
    faqs: [
      { q: "Does the app work offline?", a: "Not yet. Reporting needs a connection, and the app tells you if a report could not be saved." },
      { q: "Can we customize the incident forms?", a: "Not yet. Reports use a standard form with category, severity, photos and voice notes." }
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
        { value: "Generic", label: "Copy-pasted assessments" },
        { value: "Unread", label: "Paper RAMS" },
        { value: "Risk", label: "Exposure increases" }
      ]
    },
    solution: {
      title: "Standardized Risk Management",
      description: "Keep every risk in one register. Score likelihood and impact on a 5x5 matrix, record mitigation actions and follow risk levels on a heat map.",
      steps: [
        "Log the risk in the register",
        "Score likelihood and impact",
        "Record mitigation actions",
        "Review the heat map and export the register"
      ]
    },
    benefits: [
      { title: "Consistent Standards", desc: "Every site scores risk on the same 5x5 matrix.", icon: CheckCircle2 },
      { title: "Heat Map View", desc: "See where your highest risks sit at a glance.", icon: Zap },
      { title: "Exportable Register", desc: "Export the risk register to CSV for audits.", icon: FileText }
    ],
    features: [
      { title: "Risk Register", desc: "One register with likelihood and impact scoring." },
      { title: "5x5 Risk Matrix", desc: "Standard likelihood and impact matrix with a heat map." },
      { title: "Mitigation Tracking", desc: "Record mitigation actions against each risk." }
    ],
    useCases: [
      { role: "Supervisor", scenario: "Adds a risk found during a site walk and records the mitigation." },
      { role: "Auditor", scenario: "Exports the risk register to CSV to review current risk levels." }
    ],
    faqs: [
      { q: "Can I import my existing Excel assessments?", a: "There is no importer yet. Contact us to discuss moving your existing data." },
      { q: "Can I change the risk matrix?", a: "The register uses a fixed 5x5 likelihood and impact matrix today." }
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
        { value: "Uninformed", label: "Frontline workers" },
        { value: "Siloed", label: "Safety information" },
        { value: "Low", label: "Safety engagement" }
      ]
    },
    solution: {
      title: "One Platform for Everyone",
      description: "Bring the frontline and management onto one platform. Run briefings from a safety moments library, keep training records together and let everyone report what they see.",
      steps: [
        "Invite your team to the organization",
        "Pick a safety moment for the daily briefing",
        "Record training programs and competencies",
        "Review activity on the dashboard"
      ]
    },
    benefits: [
      { title: "Engaged Workforce", desc: "Give everyone a voice in safety.", icon: Users },
      { title: "Training in One Place", desc: "Training programs, schedules and records in one module.", icon: Smartphone },
      { title: "Visible Expiry Dates", desc: "See recorded training and certifications close to expiry.", icon: CheckCircle2 }
    ],
    features: [
      { title: "Safety Moments", desc: "Library of daily safety topics for team briefings." },
      { title: "Team Management", desc: "Invite members and organize them by site and department." },
      { title: "Training Tracker", desc: "Record training programs, sessions and competencies." }
    ],
    useCases: [
      { role: "HR Manager", scenario: "Checks which workers' certifications are close to expiry." },
      { role: "Site Lead", scenario: "Runs the morning briefing from the Safety Moments library." }
    ],
    faqs: [
      { q: "Can we manage external contractors?", a: "Yes. The Contractor Management module keeps contractor records, safety ratings and induction records. Contractors do not get their own login." }
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
        { value: "Manual", label: "Monthly reporting" },
        { value: "Lagging", label: "Indicators only" },
        { value: "Blind", label: "To emerging trends" }
      ]
    },
    solution: {
      title: "Dashboards Built From Your Reports",
      description: "See your safety performance as reports come in. Track reporting activity, severity and locations, and generate an AI safety forecast from your own reports.",
      steps: [
        "Reports collected from the field",
        "Aggregated into dashboards",
        "AI forecast generated on request",
        "Export a PDF summary"
      ]
    },
    benefits: [
      { title: "Predictive Safety", desc: "An AI forecast built from your organization's reports.", icon: BarChart3 },
      { title: "Less Admin Time", desc: "Dashboards update from submitted reports.", icon: Clock },
      { title: "Executive Visibility", desc: "Give leadership a clear view of HSE performance.", icon: CheckCircle2 }
    ],
    features: [
      { title: "Reporting Dashboards", desc: "Reporting activity, severity mix and top locations by time range." },
      { title: "AI Safety Forecast", desc: "Generate a forecast and track how accurate past forecasts were." },
      { title: "Exports", desc: "PDF analytics summary and CSV exports of registers." }
    ],
    useCases: [
      { role: "HSE Director", scenario: "Spots a rise in reports at one location and schedules targeted training." },
      { role: "CEO", scenario: "Reviews the dashboard and AI forecast before the monthly safety meeting." }
    ],
    faqs: [
      { q: "Can I export the raw data?", a: "Registers and compliance packs export to CSV, and the analytics summary exports to PDF." },
      { q: "Is PowerBI integration supported?", a: "Not yet. There is no public API today." }
    ]
  },
  "contractor-management": {
    title: "Contractor Management",
    subtitle: "Keep contractor safety records in one place.",
    icon: HardHat,
    heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "The Compliance Gap",
      description: "Contractors often fall outside standard safety loops. Verifying insurance, training, and inductions manually at the gate creates bottlenecks and leaves liability gaps.",
      stats: [
        { value: "Gaps", label: "Contractor safety records" },
        { value: "High", label: "Liability exposure" },
        { value: "Slow", label: "Manual checks" }
      ]
    },
    solution: {
      title: "Contractor Records Together",
      description: "Keep each contractor's details, safety rating and induction records together, so your safety team can check status before work starts.",
      steps: [
        "Add the contractor and contact details",
        "Record a safety rating",
        "Review induction records and their status",
        "Check status before work starts"
      ]
    },
    benefits: [
      { title: "Clear Status", desc: "See active contractors and pending inductions.", icon: ShieldCheck },
      { title: "Safety Ratings", desc: "Rate contractors and filter by rating.", icon: Clock },
      { title: "One Register", desc: "Every contractor company in one searchable list.", icon: Users }
    ],
    features: [
      { title: "Contractor Register", desc: "Company, contacts, status and safety rating." },
      { title: "Induction Records", desc: "Induction type, date, status and score for each contractor." },
      { title: "Rating Filters", desc: "Find contractors by status and safety rating." }
    ],
    useCases: [
      { role: "Safety Officer", scenario: "Checks a contractor's induction status before work starts." },
      { role: "Procurement", scenario: "Checks safety rating of potential vendors before awarding contracts." }
    ],
    faqs: [
      { q: "Does this handle visitor sign-in or badges?", a: "No. Visitor sign-in and badge printing are not part of the product today." }
    ]
  },
  "environmental-compliance": {
    title: "Environmental Compliance",
    subtitle: "Keep your environmental records audit-ready.",
    icon: Leaf,
    heroImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop",
    problem: {
      title: "Regulatory Complexity",
      description: "Tracking waste streams, emissions, and spill incidents across multiple sites is a logistical nightmare. Missed reporting deadlines can lead to massive fines and reputational damage.",
      stats: [
        { value: "$$$", label: "Potential regulatory fines" },
        { value: "Complex", label: "Reporting standards" },
        { value: "Manual", label: "Data collection" }
      ]
    },
    solution: {
      title: "Simplified Environmental Records",
      description: "Centralize your environmental data. Log waste manifests, spills and permits, and export CSV compliance packs for regulators.",
      steps: [
        "Log waste transfer notes digitally",
        "Record spills and remediation plans",
        "Track permit expiry dates",
        "Export a CSV compliance pack"
      ]
    },
    benefits: [
      { title: "Fewer Missed Renewals", desc: "The dashboard flags permits expiring within 90 days.", icon: DollarSign },
      { title: "Structured Records", desc: "Environmental records kept in one consistent structure.", icon: Leaf },
      { title: "Spill Records", desc: "Severity, status and remediation plan for each spill.", icon: Zap }
    ],
    features: [
      { title: "Waste Manifesting", desc: "Digital tracking of waste from generation to disposal." },
      { title: "Spill Reporting", desc: "Log spills with severity, status and remediation plans." },
      { title: "Permit Tracking", desc: "Record environmental permits and see those expiring within 90 days." }
    ],
    useCases: [
      { role: "Env Manager", scenario: "Sees on the dashboard that a discharge permit expires within 90 days and starts renewal." },
      { role: "Site Admin", scenario: "Logs a waste manifest when a waste load leaves site." }
    ],
    faqs: [
      { q: "Does it calculate carbon emissions or Scope 1, 2 & 3?", a: "Not yet. There is no carbon or Scope 1, 2 and 3 calculator today." }
    ]
  }
};
