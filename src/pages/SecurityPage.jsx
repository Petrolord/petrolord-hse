import React from 'react';
import { Helmet } from 'react-helmet';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import DocumentationHeader from '@/components/documentation/DocumentationHeader';
import TableOfContents from '@/components/documentation/TableOfContents';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import { Shield, Lock, Server, Eye, FileCheck, AlertTriangle } from 'lucide-react';

const sections = [
  { id: 'overview', title: '1. Security Overview' },
  { id: 'encryption', title: '2. Data Encryption' },
  { id: 'access-control', title: '3. Authentication & Access Control' },
  { id: 'network', title: '4. Network Security' },
  { id: 'infrastructure', title: '5. Infrastructure Security' },
  { id: 'application', title: '6. Application Security' },
  { id: 'data-protection', title: '7. Data Protection & Privacy' },
  { id: 'backup', title: '8. Backup & Disaster Recovery' },
  { id: 'monitoring', title: '9. Monitoring & Logging' },
  { id: 'compliance', title: '10. Compliance & Certifications' },
  { id: 'incident-response', title: '11. Incident Response' },
  { id: 'employee', title: '12. Employee Security' },
  { id: 'third-party', title: '13. Third-Party Security' },
  { id: 'vulnerability', title: '14. Vulnerability Management' },
  { id: 'best-practices', title: '15. User Security Best Practices' },
  { id: 'api', title: '16. API Security' },
  { id: 'mobile', title: '17. Mobile Security' },
  { id: 'roadmap', title: '18. Security Roadmap' },
  { id: 'report', title: '19. Report a Security Issue' },
  { id: 'contact', title: '20. Contact & Support' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#b0b0c0] font-sans">
      <Helmet>
        <title>Security - Petrolord HSE</title>
        <meta name="description" content="Petrolord HSE Security Architecture and Practices. Detailed overview of our enterprise-grade security measures." />
      </Helmet>

      <PublicNavbar />

      <DocumentationHeader
        title="Security at Petrolord HSE"
        subtitle="Security is not just a feature; it's our foundation. We employ enterprise-grade security measures to protect your critical safety data."
        lastUpdated="December 17, 2025"
        version="4.0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Security Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#252541] p-6 rounded-lg border border-[#3a3a5a]">
            <Shield className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Bank-Level Encryption</h3>
            <p className="text-sm">AES-256 encryption at rest and TLS 1.3 in transit ensures your data remains confidential.</p>
          </div>
          <div className="bg-[#252541] p-6 rounded-lg border border-[#3a3a5a]">
            <Server className="h-8 w-8 text-[#FFC107] mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Resilient Infrastructure</h3>
            <p className="text-sm">Hosted on top-tier cloud providers with redundant data centers and automatic failover.</p>
          </div>
          <div className="bg-[#252541] p-6 rounded-lg border border-[#3a3a5a]">
            <Lock className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">SOC 2 Compliant</h3>
            <p className="text-sm">Rigorous auditing and compliance with industry standards for security and availability.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <TableOfContents sections={sections} />
          </aside>

          {/* Content */}
          <main className="lg:col-span-9 max-w-4xl">
            <DocumentationSection id="overview" title="1. Security Overview">
              <p>
                At Petrolord HSE, protecting your data is our highest priority. We use a defense-in-depth strategy that layers multiple security controls to protect the confidentiality, integrity, and availability of your information. Our security program is continuously monitored and improved to meet the evolving threat landscape.
              </p>
            </DocumentationSection>

            <DocumentationSection id="encryption" title="2. Data Encryption">
              <p>
                We encrypt data everywhere. All data transmitted between your device and our servers is encrypted using strong TLS 1.2+ protocols. Data at rest is encrypted using AES-256 standards. This includes backups, database files, and uploaded media assets.
              </p>
            </DocumentationSection>

            <DocumentationSection id="access-control" title="3. Authentication & Access Control">
              <p>
                We implement strict access controls. User authentication is managed via secure, industry-standard protocols (OAuth2, OpenID Connect). We support Multi-Factor Authentication (MFA) and Single Sign-On (SSO) for enterprise plans. Internally, we follow the principle of least privilege, ensuring employees only have access to the data necessary for their specific role.
              </p>
            </DocumentationSection>

            <DocumentationSection id="network" title="4. Network Security">
              <p>
                Our infrastructure is protected by advanced firewalls and DDoS mitigation systems. We utilize Virtual Private Clouds (VPCs) to isolate our application and database layers from the public internet. Intrusion Detection Systems (IDS) constantly monitor network traffic for suspicious activity.
              </p>
            </DocumentationSection>

            <DocumentationSection id="infrastructure" title="5. Infrastructure Security">
              <p>
                Petrolord HSE is hosted on enterprise-grade cloud infrastructure. Our data centers feature physical security measures including biometric access controls, 24/7 security staff, and video surveillance. We utilize auto-scaling groups to handle load spikes and ensure availability.
              </p>
            </DocumentationSection>

            <DocumentationSection id="application" title="6. Application Security">
              <p>
                Our secure development lifecycle (SDLC) includes regular code reviews, static code analysis, and dependency scanning. We actively test against the OWASP Top 10 vulnerabilities. Our application enforces strict input validation and output encoding to prevent attacks like SQL Injection and Cross-Site Scripting (XSS).
              </p>
            </DocumentationSection>

            <DocumentationSection id="data-protection" title="7. Data Protection & Privacy">
              <p>
                We are committed to GDPR and CCPA compliance. Our architecture supports data residency requirements and provides tools for data minimization and purpose limitation. We ensure that personal data is processed lawfully, fairly, and transparently.
              </p>
            </DocumentationSection>

            <DocumentationSection id="backup" title="8. Backup & Disaster Recovery">
              <p>
                We perform automated daily backups of all databases. Backups are encrypted and stored in geographically distributed locations to ensure data survival in the event of a regional catastrophe. Our Disaster Recovery Plan is tested annually to verify our Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).
              </p>
            </DocumentationSection>

            <DocumentationSection id="monitoring" title="9. Monitoring & Logging">
              <p>
                We maintain comprehensive audit logs of all system access and administrative actions. Real-time monitoring alerts our security operations center (SOC) to potential incidents. Log data is retained securely for forensic analysis.
              </p>
            </DocumentationSection>

            <DocumentationSection id="compliance" title="10. Compliance & Certifications">
              <p>
                Petrolord HSE aligns with international standards including ISO 27001 for information security and ISO 45001 for occupational health and safety management systems. We undergo regular third-party penetration testing and security audits.
              </p>
            </DocumentationSection>

            <DocumentationSection id="incident-response" title="11. Incident Response">
              <p>
                We have a dedicated Incident Response Team available 24/7. Our Incident Response Plan outlines specific procedures for containment, eradication, and recovery from security incidents. We are committed to transparent communication with affected customers in the event of a data breach.
              </p>
            </DocumentationSection>

            <DocumentationSection id="employee" title="12. Employee Security">
              <p>
                All employees undergo background checks prior to employment. We conduct mandatory security awareness training upon hire and annually thereafter. Employees sign strict confidentiality agreements and access to production systems is granted only through secure VPNs with MFA.
              </p>
            </DocumentationSection>

            <DocumentationSection id="third-party" title="13. Third-Party Security">
              <p>
                We carefully vet all third-party vendors and sub-processors. Our vendor risk management program ensures that our partners meet our high security standards. We have Data Processing Agreements (DPAs) in place with all critical vendors.
              </p>
            </DocumentationSection>

            <DocumentationSection id="vulnerability" title="14. Vulnerability Management">
              <p>
                We run automated vulnerability scans on our infrastructure and dependencies. We maintain a responsible disclosure program and encourage security researchers to report findings. Critical patches are applied within defined service level agreements (SLAs).
              </p>
            </DocumentationSection>

            <DocumentationSection id="best-practices" title="15. User Security Best Practices">
              <p>
                We encourage users to enable MFA, use strong, unique passwords, and be vigilant against phishing attempts. Avoid accessing the platform from public Wi-Fi without a VPN. Immediately report any suspicious account activity to our support team.
              </p>
            </DocumentationSection>

            <DocumentationSection id="api" title="16. API Security">
              <p>
                Our public APIs are secured using OAuth 2.0. We implement rate limiting to prevent abuse and ensure service stability. All API endpoints validate input strictly and utilize HTTPS for all communication.
              </p>
            </DocumentationSection>

            <DocumentationSection id="mobile" title="17. Mobile Security">
              <p>
                Our mobile apps utilize secure storage for cached data and certificate pinning to prevent Man-in-the-Middle (MitM) attacks. We implement root/jailbreak detection to warn users if their device security is compromised.
              </p>
            </DocumentationSection>

            <DocumentationSection id="roadmap" title="18. Security Roadmap">
              <p>
                We are constantly evolving. Our roadmap includes enhanced anomaly detection using AI, broader compliance certifications (e.g., HIPAA specific modules), and advanced customer-managed encryption keys (CMEK).
              </p>
            </DocumentationSection>

            <DocumentationSection id="report" title="19. Report a Security Issue">
              <p>
                If you believe you have found a security vulnerability in Petrolord HSE, please report it to us immediately. We appreciate the contributions of the security research community.
              </p>
              <p className="mt-2 text-white">
                Please email <a href="mailto:security@petrolord.com" className="text-emerald-400 hover:underline">security@petrolord.com</a>.
              </p>
            </DocumentationSection>

            <DocumentationSection id="contact" title="20. Contact & Support">
              <p>
                For specific questions about our security practices or to request a copy of our latest security audit report, please contact our Security Team at <a href="mailto:security@petrolord.com" className="text-emerald-400 hover:underline">security@petrolord.com</a>.
              </p>
            </DocumentationSection>
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}