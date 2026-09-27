import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { pricingTiers, professionalPricing } from '@/components/pricing/data';
import './HomePage.css';

// Public homepage, redesigned 2026-09-27 into the Petrolord visual family
// shared with the Suite (petrolord.com) and NextGen Academy homepages:
// petrol-green ink, ivory paper, gold accent; Cormorant Garamond for display,
// Public Sans for text, IBM Plex Mono for figures. Every style is scoped under
// .hse-home in HomePage.css, so the app screens do not change.
//
// Plans and prices come from src/components/pricing/data.js, the same source
// the /pricing page and the in-app upgrade read. Copy follows the owner style
// rule: no em dashes and no contrastive "X, not Y" constructions.

const WORDMARK = '/petrolord-hse-wordmark.png';
const SUITE_URL = 'https://petrolord.com';
const NEXTGEN_URL = 'https://nextgen.petrolord.com';
const SUPPORT_EMAIL = 'support@petrolord.com';

export const NAV = [
  ['#features', 'Features'],
  ['#benefits', 'Why HSE'],
  ['#start', 'How it works'],
  ['#pricing', 'Pricing'],
  ['#faq', 'FAQ'],
];

// Feature cards link to the existing /benefits/:slug pages (src/data/benefitsData.js).
export const FEATURES = [
  { slug: 'incident-management', title: 'Incident management', body: 'Report, assign and investigate incidents and observations from one place.' },
  { slug: 'risk-assessment', title: 'Risk assessment', body: 'Identify, evaluate and mitigate risks across all operations with a live risk register.' },
  { slug: 'team-collaboration', title: 'Team collaboration and compliance', body: 'Coordinate teams, training and regulatory compliance on one platform.' },
  { slug: 'analytics-reporting', title: 'Analytics and reporting', body: 'Track KPIs on live dashboards and produce reports from your own records.' },
  { slug: 'contractor-management', title: 'Contractor management', body: 'Keep contractor records, induction records and contractor incidents in one place.' },
  { slug: 'environmental-compliance', title: 'Environmental compliance', body: 'Log flaring, waste manifests, spills and permits, and export CSV compliance packs.' },
];

export const PILLARS = [
  { title: 'Health, safety, security and environment together', body: 'One platform for all four disciplines, so reports, actions and audits no longer sit in separate systems.' },
  { title: 'Anyone on site can report', body: 'Post a QR code at each site. Anyone can scan it and report an observation, and the report lands with your supervisors.' },
  { title: 'Investigations that close', body: 'Supervisors assign reports for investigation, record root causes with a 5 Whys analysis and track actions to completion.' },
  { title: 'Ready for the auditor', body: 'Record the frameworks that apply to you, such as ISO 45001 or OSHA, and keep permits and audits in one place.' },
  { title: 'Every level of the workforce', body: 'Field staff, supervisors, managers and administrators each see the tools for their role, and everyone can join on every plan.' },
  { title: 'Grows with your operation', body: 'Add sites, departments and team members as you grow, and move up a team size band when you need to.' },
  { title: 'Forecasts from your own history', body: 'An AI safety forecast reads your own incident and observation records and highlights where risk is rising.' },
  { title: 'Secure by design', body: 'Encrypted connections, per-organisation data isolation and an audit log of investigation activity.' },
];

export const STEPS = [
  { title: 'Sign up free', body: 'Create your organisation account in minutes. No credit card is needed.' },
  { title: 'Set up your organisation', body: 'Add your sites, departments and team, and choose each person’s role.' },
  { title: 'Start recording', body: 'Log incidents, observations, permits and audits from the field or the office.' },
  { title: 'See the picture', body: 'Follow live dashboards and safety statistics, and export reports when you need them.' },
];

export const FAQS = [
  { q: 'Is the Free tier really free?', a: 'Yes. The Free tier is free forever, with unlimited users and the core safety modules: Incident Management, Observations, Risk Assessments and a basic dashboard. It has monthly usage caps on reports and incidents, and it does not send emails.' },
  { q: 'How does paid pricing work?', a: 'The Professional plan is priced by team size band, from 1-10 users up to 2,501-5,000 users. Pick your band on the pricing card and the price updates instantly. Above 5,000 users, talk to us about Enterprise.' },
  { q: 'How do I pay for Professional?', a: 'Professional plans are bought and renewed online, by card or bank transfer, through our payment partners Paystack and Stripe.' },
  { q: 'How do I get started?', a: 'Choose Get started free, create your organisation account and invite your team. It takes a couple of minutes and no credit card is needed.' },
  { q: 'Is my data secure?', a: 'Connections are encrypted, each organisation’s data is kept apart from every other organisation, and investigation activity is written to an audit log.' },
  { q: 'Can I export my data?', a: 'Yes, you own your data. You can export registers and compliance packs as CSV and analytics summaries as PDF.' },
  { q: 'Is there a limit on users?', a: 'No. Every plan, including Free, lets your entire workforce join so everyone can be part of the safety culture. Paid plans are priced by team size band, with no hard cap on users inside a band.' },
];

// Module names shown in the hero illustration are the real sidebar entries
// (src/components/LeftNav.jsx).
const RAIL = ['Dashboard', 'Safety Statistics', 'Work Permits', 'Risk Mgmt', 'Safety Audits', 'Environment', 'Training'];

// Sample 5 x 5 risk matrix for the hero illustration (likelihood rows from
// high to low, consequence columns from low to high). Illustrative only.
const MATRIX = [
  [0, 1, 0, 1, 0],
  [1, 2, 3, 1, 0],
  [2, 4, 2, 1, 0],
  [3, 5, 2, 0, 0],
  [4, 2, 1, 0, 0],
];
const band = (r, c) => {
  const score = (5 - r) * (c + 1);
  if (score >= 15) return 'hi';
  if (score >= 8) return 'md';
  return 'lo';
};

function HseWindow() {
  return (
    <div className="window" role="img" aria-label="Illustration of the Petrolord HSE workspace with a sample risk matrix">
      <div className="win-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <span className="win-title">Petrolord HSE · Sample Site</span>
      </div>
      <div className="win-body" aria-hidden="true">
        <ul className="win-rail">
          {RAIL.map((m) => <li key={m} className={m === 'Risk Mgmt' ? 'on' : undefined}>{m}</li>)}
        </ul>
        <div className="win-main">
          <div className="win-crumb">Risk Mgmt · Risk register · Sample Site</div>
          <div className="matrix-card">
            <div className="matrix">
              {MATRIX.map((row, r) => row.map((n, c) => (
                <span key={`${r}-${c}`} className={`cell ${band(r, c)}`}>{n || ''}</span>
              )))}
            </div>
            <div className="axis">Rows show likelihood and columns show consequence.</div>
          </div>
          <div className="win-kpis">
            <div><small>Open actions</small><b>12</b></div>
            <div><small>Observations</small><b>48</b></div>
            <div><small>Live permits</small><b>6</b></div>
          </div>
        </div>
      </div>
      <span className="win-sample" aria-hidden="true">Sample data</span>
    </div>
  );
}

// Plan cards. Mirrors PricingCards (the /pricing page) so the links and prices
// are identical: signed-in users go to in-app checkout or the dashboard.
function Plans({ session }) {
  const [annual, setAnnual] = useState(true);
  const [bandIdx, setBandIdx] = useState(0);
  const b = professionalPricing[bandIdx];
  const proPrice = annual ? b.annual : b.monthly;
  const perUser = (proPrice / b.maxUsers).toFixed(2);

  const price = (tier) => {
    if (tier.id === 'free') return ['$0', '/mo'];
    if (tier.id === 'enterprise') return ['Custom', ''];
    return [`$${proPrice.toLocaleString('en-US')}`, '/mo'];
  };
  const sub = (tier) => {
    if (tier.id === 'professional') {
      return annual
        ? `Billed $${(b.annual * 12).toLocaleString('en-US')} yearly. From $${perUser} per user per month.`
        : `Billed monthly. From $${perUser} per user per month.`;
    }
    if (tier.id === 'free') return 'Free forever. No credit card required.';
    return 'For teams above 5,000 users or special requirements.';
  };
  const href = (tier) => {
    if (session && tier.id === 'professional') return '/dashboard/upgrade';
    if (session && tier.id === 'free') return '/dashboard';
    return tier.href;
  };

  return (
    <>
      <div className="billing" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
        <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <span className="save">save about 10%</span></button>
      </div>
      <div className="plans">
        {pricingTiers.map((tier) => {
          const [amount, period] = price(tier);
          const to = href(tier);
          const cls = `btn ${tier.highlight ? 'btn-gold' : 'btn-line'}`;
          return (
            <article key={tier.id} className={`plan${tier.highlight ? ' feature' : ''}`}>
              <p className="eyebrow">{tier.name}</p>
              <p className="plan-desc">{tier.description}</p>
              <p className="amount">{amount}{period && <small>{period}</small>}</p>
              <p className="plan-sub">{sub(tier)}</p>
              {tier.id === 'professional' && (
                <div className="bands">
                  <p id="band-label">How many people are on your team?</p>
                  <div role="radiogroup" aria-labelledby="band-label">
                    {professionalPricing.map((pb, i) => (
                      <button key={pb.label} type="button" role="radio" aria-checked={i === bandIdx} onClick={() => setBandIdx(i)}>
                        {pb.label}
                      </button>
                    ))}
                  </div>
                  <p className="bands-note">Users per band. More than 5,000 users? Enterprise is for you.</p>
                </div>
              )}
              <ul className="ticks">
                {tier.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div className="plan-cta">
                {to.startsWith('/') ? <Link className={cls} to={to}>{tier.cta}</Link> : <a className={cls} href={to}>{tier.cta}</a>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function HomePage() {
  const { session } = useAuth() || {};
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Deep links such as /#pricing from other pages scroll to the section.
  useEffect(() => {
    if (!location.hash) return undefined;
    const t = setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <div className="hse-home">
      <Helmet>
        <title>Petrolord HSE | Health, safety, security and environment in one place</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0C1F16" />
        <meta
          name="description"
          content="Incident reporting, risk assessment, work permits, audits, contractor safety and environmental compliance for the whole workforce. Free forever with unlimited users, with a Professional plan as your team grows."
        />
      </Helmet>

      <a className="skip" href="#main">Skip to content</a>

      <header className="site">
        <div className="wrap nav">
          <Link className="brand" to="/" aria-label="Petrolord HSE home">
            <img className="wordmark" src={WORDMARK} alt="Petrolord HSE" width="979" height="108" />
          </Link>
          <nav className="links" aria-label="Main">
            {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="nav-cta">
            {session ? (
              <Link className="btn btn-gold" to="/dashboard">Dashboard</Link>
            ) : (
              <>
                <Link className="login" to="/login">Log in</Link>
                <Link className="btn btn-gold" to="/signup">Get started free</Link>
              </>
            )}
            <button
              type="button"
              className="menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="hse-mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <nav id="hse-mobile-menu" className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-label="Mobile">
          {NAV.map(([href, label]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
          {!session && <Link to="/login" onClick={closeMenu}>Log in</Link>}
        </nav>
      </header>

      <main id="main">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Petrolord HSE</p>
              <h1>Health, safety, security and environment, <em>in one place for the whole workforce.</em></h1>
              <p className="lede">
                Petrolord HSE is the digital platform for your health, safety, security and environment workflows,
                from the first observation on site to the audit report. Built for the modern energy enterprise.
              </p>
              <div className="ctas">
                {session ? (
                  <Link className="btn btn-gold" to="/dashboard">Open your dashboard <ArrowRight className="w-4 h-4" /></Link>
                ) : (
                  <Link className="btn btn-gold" to="/signup">Get started free <ArrowRight className="w-4 h-4" /></Link>
                )}
                <a className="btn btn-ghost" href="#pricing">See plans and pricing</a>
              </div>
              <p className="fine">Free forever with unlimited users. No credit card needed.</p>
            </div>
            <HseWindow />
          </div>
          <div className="ledger">
            <ul className="wrap" aria-label="Petrolord HSE at a glance">
              <li><strong>Free</strong><span>forever, with unlimited users on every plan</span></li>
              <li><strong>4</strong><span>disciplines: health, safety, security and environment</span></li>
              <li><strong>{professionalPricing.length}</strong><span>team size bands on the Professional plan</span></li>
              <li><strong>0</strong><span>software to install. It runs in the browser</span></li>
            </ul>
          </div>
        </section>

        <section className="block cat-bg" id="features">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">Features</p>
              <h2>Everything your safety programme runs on.</h2>
              <p>Manage safety, compliance and risk in one platform. Choose a feature to see how it works.</p>
            </div>
            <div className="card-grid">
              {FEATURES.map((f) => (
                <Link className="card" key={f.slug} to={`/benefits/${f.slug}`}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  <span className="go">Learn more <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="block" id="benefits">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">Why Petrolord HSE</p>
              <h2>Built for the people who keep the site safe.</h2>
              <p>A safety programme works when everyone can take part and every report leads somewhere.</p>
            </div>
            <ol className="pillars">
              {PILLARS.map((p, i) => (
                <li key={p.title}><span className="n">{String(i + 1).padStart(2, '0')}</span><h3>{p.title}</h3><p>{p.body}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="block cat-bg" id="start">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">How it works</p>
              <h2>Up and running in minutes.</h2>
              <p>No complex setup and no credit card. Just effective safety management.</p>
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title}><span className="n">Step {i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="block price-sec" id="pricing">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">Pricing</p>
              <h2>Start free. <em>Upgrade as your team grows.</em></h2>
              <p>Start free with unlimited users, and upgrade for advanced compliance and automation. Prices are in US dollars and scale with your team size.</p>
            </div>
            <Plans session={session} />
            <div className="plan-foot">
              <p>Professional plans are bought and renewed online by card or bank transfer. Compare every feature, plan by plan, on the full pricing page.</p>
              <Link className="btn btn-gold" to="/pricing">Compare all features <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        <section className="block" id="family">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">The Petrolord family</p>
              <h2>Part of one platform for the energy enterprise.</h2>
              <p>Your HSE sign-in and organisation work across Petrolord, so the whole team can grow into the rest of the family.</p>
            </div>
            <div className="family">
              <article className="suite">
                <p className="eyebrow">Petrolord Suite</p>
                <h3>Engineering software for the whole energy asset.</h3>
                <p>The digital operating system for the modern energy enterprise, connecting subsurface intelligence, operational efficiency and commercial strategy.</p>
                <div className="actions"><a className="btn btn-gold" href={SUITE_URL}>Explore the Suite <ArrowRight className="w-4 h-4" /></a></div>
              </article>
              <article className="ng">
                <p className="eyebrow">NextGen Academy</p>
                <h3>Learn on the same apps you will work with.</h3>
                <p>Hands-on energy courses taught inside the Petrolord Suite, from geoscience to HSE, with certificates anyone can verify.</p>
                <div className="actions"><a className="btn btn-primary" href={NEXTGEN_URL}>Visit NextGen Academy <ArrowRight className="w-4 h-4" /></a></div>
              </article>
            </div>
          </div>
        </section>

        <section className="block flush" id="faq">
          <div className="wrap faq-wrap">
            <div className="head">
              <p className="eyebrow">Questions</p>
              <h2>Frequently asked questions.</h2>
            </div>
            <div className="faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="block final" id="contact">
          <div className="wrap">
            <p className="eyebrow">Start today</p>
            <h2>Build a safer workplace, <em>starting today.</em></h2>
            <p>Free to start and ready in minutes. Bring your whole workforce into the safety culture.</p>
            <div className="ctas">
              {session ? (
                <Link className="btn btn-gold" to="/dashboard">Open your dashboard</Link>
              ) : (
                <Link className="btn btn-gold" to="/signup">Get started free</Link>
              )}
              <a className="btn btn-ghost" href={`mailto:${SUPPORT_EMAIL}?subject=Petrolord%20HSE%20enquiry`}>Talk to us</a>
            </div>
            <p className="contact-line"><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · <a href={SUITE_URL}>petrolord.com</a></p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <Link className="brand" to="/" aria-label="Petrolord HSE home">
              <img className="wordmark" src={WORDMARK} alt="Petrolord HSE" width="979" height="108" />
            </Link>
            <p>The HSE component of the digital operating system for the modern energy enterprise. A Lordsway Energy company.</p>
          </div>
          <FooterCol title="Product">
            <a href="#features">Features</a>
            <a href="#benefits">Why HSE</a>
            <a href="#pricing">Pricing</a>
            <Link to="/pricing">Compare plans</Link>
            <a href="#faq">FAQ</a>
          </FooterCol>
          <FooterCol title="Petrolord">
            <a href={SUITE_URL}>Petrolord Suite</a>
            <a href={NEXTGEN_URL}>NextGen Academy</a>
          </FooterCol>
          <FooterCol title="Legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/security">Security</Link>
          </FooterCol>
          <FooterCol title="Contact">
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <a href={SUITE_URL}>petrolord.com</a>
          </FooterCol>
        </div>
        <div className="wrap foot-bottom">
          <span>© {new Date().getFullYear()} Lordsway Energy. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="foot-col">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
