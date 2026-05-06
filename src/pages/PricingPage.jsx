import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import PricingHero from '@/components/pricing/PricingHero';
import PricingCards from '@/components/pricing/PricingCards';
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import PricingCTA from '@/components/pricing/PricingCTA';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans overflow-x-hidden">
      <Helmet>
        <title>Pricing - Petrolord HSE</title>
        <meta name="description" content="Simple, transparent pricing for teams of all sizes. Start for free." />
      </Helmet>

      <PublicNavbar />

      <main>
        <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        
        <PricingCards isAnnual={isAnnual} />
        
        <FeatureComparisonTable />
        
        <PricingFAQ />
        
        <PricingCTA />
      </main>

      <PublicFooter />
    </div>
  );
}