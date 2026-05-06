import React from 'react';
import { Helmet } from 'react-helmet';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import DocumentationHeader from '@/components/documentation/DocumentationHeader';
import TableOfContents from '@/components/documentation/TableOfContents';
import DocumentationSection from '@/components/documentation/DocumentationSection';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'info-collect', title: '2. Information We Collect' },
  { id: 'how-use', title: '3. How We Use Your Information' },
  { id: 'sharing', title: '4. Data Sharing & Disclosure' },
  { id: 'retention', title: '5. Data Retention' },
  { id: 'rights', title: '6. Your Privacy Rights' },
  { id: 'security', title: '7. Data Security' },
  { id: 'international', title: '8. International Data Transfers' },
  { id: 'children', title: '9. Children\'s Privacy' },
  { id: 'cookies', title: '10. Cookies & Tracking Technologies' },
  { id: 'third-party', title: '11. Third-Party Links & Services' },
  { id: 'ccpa', title: '12. California Privacy Rights (CCPA)' },
  { id: 'contact', title: '13. Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#b0b0c0] font-sans">
      <Helmet>
        <title>Privacy Policy - Petrolord HSE</title>
        <meta name="description" content="Privacy Policy for Petrolord HSE. Learn how we collect, use, and protect your personal and organizational data." />
      </Helmet>

      <PublicNavbar />

      <DocumentationHeader
        title="Privacy Policy"
        subtitle="We are committed to protecting your privacy and ensuring the security of your data. This policy outlines our practices regarding data collection, usage, and protection."
        lastUpdated="December 17, 2025"
        version="2.4"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <TableOfContents sections={sections} />
          </aside>

          {/* Content */}
          <main className="lg:col-span-9 max-w-4xl">
            <DocumentationSection id="introduction" title="1. Introduction">
              <p>
                Welcome to Petrolord HSE ("we," "our," or "us"). We value the trust you place in us when you use our health, safety, and environment management platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our Service.
              </p>
              <p>
                This policy applies to all users of Petrolord HSE, including organization administrators, staff members, contractors, and visitors. By accessing or using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </DocumentationSection>

            <DocumentationSection id="info-collect" title="2. Information We Collect">
              <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Personal Information:</strong> When you register for an account, we may ask for personal information such as your name, email address, phone number, job title, and organization name.</li>
                <li><strong>Account Information:</strong> We store your username, encrypted password, and account preferences to manage your access to the Service.</li>
                <li><strong>Usage Data:</strong> We automatically collect information on how you interact with the Service, such as IP addresses, browser type, pages visited, time spent on pages, and other diagnostic data.</li>
                <li><strong>Operational Data:</strong> In the course of using the HSE platform, you may upload data regarding incidents, observations, inspections, and risk assessments. While this is organizational data, it may contain personal identifiable information (PII) of employees or contractors.</li>
                <li><strong>Device Information:</strong> We may collect information about the device you use to access the Service, including the hardware model, operating system and version, and unique device identifiers.</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on our Service and hold certain information.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="how-use" title="3. How We Use Your Information">
              <p>Petrolord HSE uses the collected data for various purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Service Delivery:</strong> To provide and maintain our Service, including monitoring the usage of our Service.</li>
                <li><strong>Communication:</strong> To contact you with newsletters, marketing or promotional materials, and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us.</li>
                <li><strong>Support:</strong> To provide customer support and respond to your requests.</li>
                <li><strong>Analysis:</strong> To gather analysis or valuable information so that we can improve our Service.</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and security breaches.</li>
                <li><strong>Compliance:</strong> To fulfill our legal obligations and enforce our agreements.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="sharing" title="4. Data Sharing & Disclosure">
              <p>We do not sell your personal data. We may share your information in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used.</li>
                <li><strong>Business Transfers:</strong> If Petrolord HSE is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred.</li>
                <li><strong>Law Enforcement:</strong> Under certain circumstances, we may be required to disclose your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="retention" title="5. Data Retention">
              <p>
                We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
              </p>
              <p>
                Operational safety data (incidents, reports) is typically retained for the duration of your organization's subscription plus a grace period, or as required by industrial safety regulations (e.g., OSHA record-keeping requirements).
              </p>
            </DocumentationSection>

            <DocumentationSection id="rights" title="6. Your Privacy Rights">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data.</li>
                <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="security" title="7. Data Security">
              <p>
                The security of your data is important to us. We use commercial best practices to protect your Personal Data, including encryption at rest and in transit, strict access controls, and regular security audits. However, remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </DocumentationSection>

            <DocumentationSection id="international" title="8. International Data Transfers">
              <p>
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction.
              </p>
              <p>
                If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to secure cloud servers and process it there. We utilize Standard Contractual Clauses (SCCs) and other mechanisms to ensure GDPR compliance for data transfers from the EU.
              </p>
            </DocumentationSection>

            <DocumentationSection id="children" title="9. Children's Privacy">
              <p>
                Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </DocumentationSection>

            <DocumentationSection id="cookies" title="10. Cookies & Tracking Technologies">
              <p>
                We use cookies and similar tracking technologies to track the activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="third-party" title="11. Third-Party Links & Services">
              <p>
                Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </DocumentationSection>

            <DocumentationSection id="ccpa" title="12. California Privacy Rights (CCPA)">
              <p>
                If you are a California resident, you have specific rights regarding your personal information under the California Consumer Privacy Act (CCPA). You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months. You also have the right to request deletion of your personal information, subject to certain exceptions. We do not sell your personal information.
              </p>
            </DocumentationSection>

            <DocumentationSection id="contact" title="13. Contact Us">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-2 mt-4 text-white">
                <li><strong>By email:</strong> privacy@petrolord.com</li>
                <li><strong>By mail:</strong> 8 The Providence Street, Lekki Phase 1, Lagos, Nigeria</li>
              </ul>
            </DocumentationSection>
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}