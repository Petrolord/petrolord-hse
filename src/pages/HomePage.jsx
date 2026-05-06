import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, Users, BarChart3, HardHat, CheckCircle2, Globe, Zap, Database, ArrowRight, ChevronRight, Leaf, Brain, Lock, Headphones as Headset, Layers } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import PricingCards from '@/components/pricing/PricingCards';
import PricingToggle from '@/components/pricing/PricingToggle';

// Updated features array with slugs matching benefitsData
const features = [{
  icon: AlertTriangle,
  title: "Real-Time Incident Management",
  description: "Track, report, and manage incidents instantly with automated workflows and compliance tracking.",
  slug: "incident-management"
}, {
  icon: ShieldCheck,
  title: "Comprehensive Risk Assessment",
  description: "Identify, evaluate, and mitigate risks across all operations with data-driven insights.",
  slug: "risk-assessment"
}, {
  icon: Users,
  title: "Team Collaboration & Compliance",
  description: "Unified platform for team coordination, training, and regulatory compliance management.",
  slug: "team-collaboration"
}, {
  icon: BarChart3,
  title: "Advanced Analytics & Reporting",
  description: "Generate professional reports, track KPIs, and gain actionable insights from real-time data.",
  slug: "analytics-reporting"
}, {
  icon: HardHat,
  title: "Contractor & Visitor Management",
  description: "Streamline onboarding, inductions, and safety compliance for all site personnel.",
  slug: "contractor-management"
}, {
  icon: Leaf,
  title: "Carbon & Environmental Compliance",
  description: "Track emissions, waste, spills, and permits with audit-ready logs, ESG dashboards, and automated reminders for regulatory filings.",
  slug: "environmental-compliance"
}];

const benefits = [
  {
    title: "Comprehensive HSE Management",
    desc: "A single, unified platform covering Health, Safety, Security, and Environment. Eliminate silos and manage everything in one place.",
    icon: Layers,
    highlight: "All-in-one"
  },
  {
    title: "Real-Time Reporting & Analytics",
    desc: "Generate professional reports instantly and track KPIs with live dashboards. Turn data into actionable safety insights.",
    icon: BarChart3,
    highlight: "Data-driven"
  },
  {
    title: "Seamless Collaboration",
    desc: "Connect your entire workforce, from field staff to management. Assign tasks, share updates, and drive safety culture together.",
    icon: Users,
    highlight: "Team-focused"
  },
  {
    title: "Regulatory Compliance",
    desc: "Stay audit-ready with automated tracking for ISO 45001, OSHA, and local regulations. Never miss a compliance deadline.",
    icon: CheckCircle2,
    highlight: "Audit-ready"
  },
  {
    title: "Scalable & Flexible",
    desc: "Whether you're a small team or a global enterprise, our platform grows with you. Custom workflows adapt to your specific needs.",
    icon: Leaf,
    highlight: "Future-proof"
  },
  {
    title: "Predictive Risk Intelligence",
    desc: "AI-powered analytics that predict potential hazards before they occur, helping you stay ahead of risks and prevent incidents.",
    icon: Brain,
    highlight: "Proactive AI"
  },
  {
    title: "Global Site Management",
    desc: "Manage unlimited sites worldwide with our intuitive map-based interface. Click to select and visualize your entire operation.",
    icon: Globe,
    highlight: "Visual Control"
  },
  {
    title: "Automated Incident Workflows",
    desc: "Streamline response with intelligent automation. Notifications and task assignments ensure nothing falls through the cracks.",
    icon: Zap,
    highlight: "Efficiency"
  },
  {
    title: "Enterprise Security",
    desc: "Bank-level encryption, MFA, and comprehensive audit trails. Meet GDPR and other data protection standards with confidence.",
    icon: Lock,
    highlight: "Secure"
  },
  {
    title: "Expert Guidance & Support",
    desc: "From onboarding to optimization, our HSE experts are with you. Dedicated account managers and 24/7 support ensure success.",
    icon: Headset,
    highlight: "24/7 Support"
  }
];

const faqs = [{
  q: "Is the Free tier really free?",
  a: "Yes! Our Free tier allows unlimited users to access core safety features. It's designed for broad adoption across your organization with usage caps on reports and no email capabilities."
}, {
  q: "What features are included in the free tier?",
  a: "The Free Tier includes all essential modules: Incident Management, Observations, Risk Assessments, basic Analytics, and unlimited users."
}, {
  q: "How do I get started?",
  a: "Simply click 'Start Free', create your organization account, and invite your team. It takes less than 2 minutes."
}, {
  q: "Is my data secure?",
  a: "Absolutely. We use enterprise-grade encryption and security protocols to ensure your data is safe and compliant."
}, {
  q: "Can I export my data?",
  a: "Yes, you own your data. You can export reports and datasets in various formats (PDF, CSV, Excel) at any time."
}, {
  q: "Is there a limit on users?",
  a: "No. The Free Tier allows for unlimited users so your entire team can be part of the safety culture."
}];

export default function HomePage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const location = useLocation();

  // Scroll to section if hash is present
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Timeout to ensure DOM is ready and layout is stable
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white overflow-x-hidden font-sans">
      <Helmet>
        <title>Petrolord HSE - Free Integrated Health, Safety & Environment Platform</title>
        <meta name="description" content="The comprehensive, free HSSE management platform for the modern energy enterprise. Track incidents, manage risks, and ensure compliance." />
      </Helmet>

      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-500/30 blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <span className="inline-block py-1 px-3 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107] text-sm font-bold mb-6 tracking-wide uppercase">100% FREE TO START</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Integrated HSSE Management <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                for the Modern Energy Enterprise
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#b0b0c0] mb-10">
              Petrolord HSE is the complete digital platform to manage health, safety, security, and environment workflows. Build a safer, more compliant future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button className="h-14 px-8 text-lg bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold rounded-full shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] transition-all transform hover:-translate-y-1">
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            <div className="mt-8"></div> 

          </motion.div>
        </div>
        
        {/* Abstract Hero Image Representation */}
        <div className="mt-16 mx-auto max-w-6xl px-4 relative">
            <div className="rounded-xl bg-[#1f1f35] border border-[#3a3a5a] p-2 shadow-2xl shadow-black/50 overflow-hidden">
                <img 
                  src="https://horizons-cdn.hostinger.com/b49b4b29-7343-48e8-91d9-c4b871e9bda0/046754b00008ad42902396493cf91e75.png" 
                  alt="Petrolord HSE Dashboard Interface" 
                  className="w-full h-auto rounded-lg opacity-90" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent opacity-40"></div>
            </div>
        </div>
      </section>

      {/* FEATURES SECTION - Added scroll-mt-24 for header offset */}
      <section id="features" className="py-24 bg-[#151525] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Features</h2>
            <p className="text-[#b0b0c0] max-w-2xl mx-auto">Everything you need to manage safety, compliance, and risk in one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div key={idx} whileHover={{ y: -5 }} className="bg-[#1f1f35] p-8 rounded-xl border border-[#3a3a5a] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/20 transition-all group h-full flex flex-col">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#b0b0c0] mb-6 leading-relaxed flex-grow">{feature.description}</p>
                <Link to={`/benefits/${feature.slug}`} className="text-emerald-400 font-semibold text-sm flex items-center hover:gap-2 transition-all mt-auto">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION - Added scroll-mt-24 */}
      <section id="benefits" className="py-24 bg-[#1a1a2e] relative overflow-hidden scroll-mt-24">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose Petrolord HSE?</h2>
            <p className="text-[#b0b0c0] max-w-2xl mx-auto text-lg">
              10 reasons why leading energy organizations trust us to protect their workforce and operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {benefits.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group"
              >
                <Card className="h-full bg-[#1f1f35]/80 backdrop-blur-sm border-2 border-[#3a3a5a] hover:border-[#FFC107] transition-all duration-300 hover:shadow-xl hover:shadow-[#FFC107]/10 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-lg bg-[#FFC107]/10 text-[#FFC107] group-hover:bg-[#FFC107] group-hover:text-[#1a1a2e] transition-colors duration-300">
                        <item.icon className="h-6 w-6" />
                      </div>
                      {item.highlight && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                          {item.highlight}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-[#FFC107] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-[#9ca3af] text-sm leading-relaxed flex-grow">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#151525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Started in Minutes</h2>
            <p className="text-[#b0b0c0]">No complex setup. No credit card. Just effective safety management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[{
            title: "Sign Up Free",
            desc: "Create account in minutes, no credit card needed.",
            icon: Users
          }, {
            title: "Configure Org",
            desc: "Set up teams, roles, and safety parameters.",
            icon: Database
          }, {
            title: "Start Tracking",
            desc: "Log incidents, observations, and metrics.",
            icon: CheckCircle2
          }, {
            title: "Gain Insights",
            desc: "Access real-time dashboards and reports.",
            icon: BarChart3
          }].map((step, i) => <div key={i} className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-[#252541] border border-[#3a3a5a] flex items-center justify-center mb-6 z-10 relative">
                  <step.icon className="h-8 w-8 text-emerald-400" />
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#FFC107] text-[#1a1a2e] font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[#7a7a9a] text-sm">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-[#3a3a5a] -z-0" />}
              </div>)}
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Added scroll-mt-24 */}
      <section id="pricing" className="py-24 bg-[#1a1a2e] relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Flexible Plans for Every Safety Culture</h2>
            <p className="text-[#b0b0c0]">Start for free with unlimited users. Upgrade for advanced compliance and automation.</p>
          </div>

          <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
          
          <div className="mt-8">
            <PricingCards isAnnual={isAnnual} />
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing" className="text-[#FFC107] hover:text-[#FFD54F] font-semibold text-lg flex items-center justify-center gap-2 transition-colors">
              See detailed feature comparison <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PETROLORD SUITE */}
      <section className="py-20 bg-gradient-to-br from-[#1f1f35] to-[#151525] border-y border-[#3a3a5a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 opacity-70">
             <Globe className="h-5 w-5 text-emerald-400" />
             <span className="text-emerald-400 font-semibold tracking-wider text-sm uppercase">Part of the Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Petrolord Suite</h2>
          <p className="text-xl text-[#b0b0c0] max-w-3xl mx-auto mb-10">
            The Digital Operating System for the Modern Energy Enterprise. Connecting subsurface intelligence, operational efficiency, and commercial strategy.
          </p>
          <a href="https://petrolord.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-8 py-6 text-lg h-auto">
              Explore the Full Suite <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* FAQ SECTION - Added scroll-mt-24 */}
      <section id="faq" className="py-24 bg-[#1a1a2e] scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((item, i) => <AccordionItem key={i} value={`item-${i}`} className="border border-[#3a3a5a] rounded-lg bg-[#1f1f35] px-4">
                <AccordionTrigger className="text-white hover:no-underline hover:text-emerald-400 text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#b0b0c0]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#151525] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your HSSE Management?</h2>
          <p className="text-xl text-[#b0b0c0] mb-10">
            Join thousands of safety professionals using Petrolord HSE to build a safer workplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="h-16 px-10 text-xl bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold rounded-full shadow-xl">
                Get Started Free Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}