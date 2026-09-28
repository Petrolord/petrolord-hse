import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TEXT_LINK } from '@/components/public/PublicPage';

export default function PricingCTA() {
  return (
    <div className="w-full bg-pl-surface border-t border-pl-border py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-pl-display text-3xl sm:text-4xl font-semibold text-pl-text mb-6">Ready to prioritize safety?</h2>
        <p className="text-lg sm:text-xl text-pl-muted mb-10 max-w-2xl mx-auto">
          Start with our Free tier today. No credit card required. Upgrade anytime as your organization grows.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild variant="accent" className="h-14 px-10 text-lg font-bold rounded-full">
            <Link to="/signup">Start Free</Link>
          </Button>
          <Button asChild variant="outline" className="h-14 px-10 text-lg rounded-full">
            <a href="mailto:support@petrolord.com?subject=Petrolord%20HSE%20Sales%20Enquiry">Contact Sales</a>
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-pl-muted">
          Have questions? <a href="mailto:support@petrolord.com" className={TEXT_LINK}>Email our team</a>.
        </p>
      </div>
    </div>
  );
}