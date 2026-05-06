import React from 'react';
import { Helmet } from 'react-helmet';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import DocumentationHeader from '@/components/documentation/DocumentationHeader';
import TableOfContents from '@/components/documentation/TableOfContents';
import DocumentationSection from '@/components/documentation/DocumentationSection';

const sections = [
  { id: 'introduction', title: '1. Introduction & Acceptance' },
  { id: 'definitions', title: '2. Definitions' },
  { id: 'eligibility', title: '3. User Eligibility & Registration' },
  { id: 'license', title: '4. License & Use Rights' },
  { id: 'responsibilities', title: '5. User Responsibilities' },
  { id: 'intellectual-property', title: '6. Intellectual Property Rights' },
  { id: 'content', title: '7. User Content & Submissions' },
  { id: 'prohibited', title: '8. Prohibited Activities' },
  { id: 'payment', title: '9. Payment & Billing' },
  { id: 'cancellation', title: '10. Subscription Plans & Cancellation' },
  { id: 'liability', title: '11. Limitation of Liability' },
  { id: 'indemnification', title: '12. Indemnification' },
  { id: 'termination', title: '13. Termination' },
  { id: 'dispute', title: '14. Dispute Resolution' },
  { id: 'disclaimers', title: '15. Disclaimers' },
  { id: 'modifications', title: '16. Modifications to Service' },
  { id: 'severability', title: '17. Severability' },
  { id: 'entire-agreement', title: '18. Entire Agreement' },
  { id: 'contact', title: '19. Contact & Support' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#b0b0c0] font-sans">
      <Helmet>
        <title>Terms of Service - Petrolord HSE</title>
        <meta name="description" content="Terms of Service for Petrolord HSE. Read strict guidelines regarding usage, liability, and user responsibilities." />
      </Helmet>

      <PublicNavbar />

      <DocumentationHeader
        title="Terms of Service"
        subtitle="Please read these terms carefully before using the Petrolord HSE platform. These terms govern your access to and use of our services."
        lastUpdated="December 17, 2025"
        version="3.1"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <TableOfContents sections={sections} />
          </aside>

          {/* Content */}
          <main className="lg:col-span-9 max-w-4xl">
            <DocumentationSection id="introduction" title="1. Introduction & Acceptance">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Petrolord HSE ("we," "our," "us"). By accessing or using the Petrolord HSE website and platform (collectively, the "Service"), you agree to be bound by these Terms.
              </p>
              <p>
                If you do not agree to these Terms, do not use the Service. We may modify these Terms at any time, and such modifications shall be effective immediately upon posting the modified Terms. Your continued use of the Service shall be deemed your acceptance of the modified Terms.
              </p>
            </DocumentationSection>

            <DocumentationSection id="definitions" title="2. Definitions">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Service":</strong> The Petrolord HSE platform, website, and related services.</li>
                <li><strong>"User":</strong> Any individual who accesses or uses the Service.</li>
                <li><strong>"Organization":</strong> The legal entity that subscribes to the Service and authorizes Users to access it.</li>
                <li><strong>"Content":</strong> Data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links, and other content or materials.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="eligibility" title="3. User Eligibility & Registration">
              <p>
                You must be at least 18 years old to use the Service. By agreeing to these Terms, you represent and warrant to us that: (a) you have not previously been suspended or removed from the Service; (b) your registration and your use of the Service is in compliance with any and all applicable laws and regulations; and (c) you are authorized to bind the Organization you represent to these Terms.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or mobile device.
              </p>
            </DocumentationSection>

            <DocumentationSection id="license" title="4. License & Use Rights">
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Service solely for your internal business purposes.
              </p>
              <p>
                You shall not: (a) sell, resell, sublicense, transfer, or distribute the Service; (b) use the Service to build a competitive product or service; (c) reverse engineer the Service; or (d) interfere with or disrupt the integrity or performance of the Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="responsibilities" title="5. User Responsibilities">
              <p>
                You agree to use the Service only for lawful purposes. You represent that you have full authority to upload any data that you submit to the Service. You are solely responsible for ensuring that your use of the Service complies with all applicable laws, regulations, and industry standards, including but not limited to health and safety regulations.
              </p>
            </DocumentationSection>

            <DocumentationSection id="intellectual-property" title="6. Intellectual Property Rights">
              <p>
                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Petrolord HSE and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Petrolord HSE.
              </p>
            </DocumentationSection>

            <DocumentationSection id="content" title="7. User Content & Submissions">
              <p>
                You retain all rights to any data or content you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such Content solely for the purpose of providing and improving the Service.
              </p>
              <p>
                We claim no ownership rights over User Content. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to publish the User Content you submit.
              </p>
            </DocumentationSection>

            <DocumentationSection id="prohibited" title="8. Prohibited Activities">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Copying, distributing, or disclosing any part of the Service in any medium.</li>
                <li>Using any automated system, including "robots," "spiders," "offline readers," etc., to access the Service.</li>
                <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
                <li>Taking any action that imposes, or may impose at our sole discretion, an unreasonable or disproportionately large load on our infrastructure.</li>
                <li>Uploading invalid data, viruses, worms, or other software agents through the Service.</li>
              </ul>
            </DocumentationSection>

            <DocumentationSection id="payment" title="9. Payment & Billing">
              <p>
                Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to the pricing and payment terms as we may update them from time to time. Petrolord HSE may add new services for additional fees and charges, or amend fees and charges for existing services, at any time in its sole discretion.
              </p>
            </DocumentationSection>

            <DocumentationSection id="cancellation" title="10. Subscription Plans & Cancellation">
              <p>
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing cycle.
              </p>
              <p>
                <strong>Refunds:</strong> All fees are non-refundable unless otherwise required by law or explicitly stated in a specific service agreement.
              </p>
            </DocumentationSection>

            <DocumentationSection id="liability" title="11. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, in no event shall Petrolord HSE, its affiliates, agents, directors, employees, suppliers, or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, this Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="indemnification" title="12. Indemnification">
              <p>
                You agree to defend, indemnify and hold harmless Petrolord HSE and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from your use of and access to the Service, or from or in connection with any Content uploaded to the Service through your account.
              </p>
            </DocumentationSection>

            <DocumentationSection id="termination" title="13. Termination">
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="dispute" title="14. Dispute Resolution">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Any dispute arising from these Terms or your use of the Service shall be resolved through binding arbitration in Lagos, Nigeria, except that you may assert claims in small claims court if your claims qualify.
              </p>
            </DocumentationSection>

            <DocumentationSection id="disclaimers" title="15. Disclaimers">
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
              </p>
            </DocumentationSection>

            <DocumentationSection id="modifications" title="16. Modifications to Service">
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="severability" title="17. Severability">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid under any applicable law, such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a whole, and such provisions shall be deleted without affecting the remaining provisions herein.
              </p>
            </DocumentationSection>

            <DocumentationSection id="entire-agreement" title="18. Entire Agreement">
              <p>
                These Terms constitute the entire agreement between you and us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.
              </p>
            </DocumentationSection>

            <DocumentationSection id="contact" title="19. Contact & Support">
              <p>For support or questions regarding these Terms, please contact us:</p>
              <ul className="list-none space-y-2 mt-4 text-white">
                <li><strong>Email:</strong> legal@petrolord.com</li>
                <li><strong>Support:</strong> support@petrolord.com</li>
              </ul>
            </DocumentationSection>
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}