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
import { PublicPage } from '@/components/public/PublicPage';

export default function BenefitPageTemplate({ data }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Batch 3C: the public frame (always light) with the site navigation and footer.
  if (!data) {
    return (
      <PublicPage testId="benefit-theme-scope" header={<PublicNavbar />} mainClassName="items-center justify-center text-pl-muted">
        Loading...
      </PublicPage>
    );
  }

  return (
    <PublicPage testId="benefit-theme-scope" header={<PublicNavbar />} footer={<PublicFooter />}>
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
    </PublicPage>
  );
}