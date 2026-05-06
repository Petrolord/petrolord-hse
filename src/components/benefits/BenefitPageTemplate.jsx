import React, { useEffect } from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import BenefitHero from './BenefitHero';
import BenefitProblem from './BenefitProblem';
import BenefitSolution from './BenefitSolution';
import BenefitFeatures from './BenefitFeatures';
import BenefitUseCases from './BenefitUseCases';
import BenefitFAQ from './BenefitFAQ';
import BenefitCTA from './BenefitCTA';

export default function BenefitPageTemplate({ data }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!data) return <div className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans">
      <PublicNavbar />
      
      <BenefitHero 
        title={data.title}
        subtitle={data.subtitle}
        image={data.heroImage}
        icon={data.icon}
      />
      
      <BenefitProblem data={data.problem} />
      
      <BenefitSolution data={data.solution} />
      
      <BenefitFeatures features={data.features} benefits={data.benefits} />
      
      <BenefitUseCases useCases={data.useCases} />
      
      <BenefitFAQ faqs={data.faqs} />
      
      <BenefitCTA />
      
      <PublicFooter />
    </div>
  );
}