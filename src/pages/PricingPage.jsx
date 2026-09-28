import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import PricingHero from '@/components/pricing/PricingHero';
import PricingCards from '@/components/pricing/PricingCards';
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import PricingCTA from '@/components/pricing/PricingCTA';
import { PublicPage } from '@/components/public/PublicPage';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    // Batch 3C: the public frame (always light) with the site navigation and footer.
    <PublicPage
      testId="pricing-theme-scope"
      className="overflow-x-hidden"
      header={<PublicNavbar />}
      footer={<PublicFooter />}
    >
      <Helmet>
        <title>Pricing - Petrolord HSE</title>
        <meta name="description" content="Simple, transparent pricing for teams of all sizes. Start for free." />
      </Helmet>

      <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

      <PricingCards isAnnual={isAnnual} />

      <FeatureComparisonTable />

      <PricingFAQ />

      <PricingCTA />
    </PublicPage>
  );
}