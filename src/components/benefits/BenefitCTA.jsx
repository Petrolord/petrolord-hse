import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BenefitCTA() {
  return (
    <section className="py-16 sm:py-24 bg-pl-bg border-t border-pl-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-pl-display text-3xl md:text-5xl font-semibold text-pl-text mb-6">Start Your Transformation Today</h2>
        <p className="text-lg sm:text-xl text-pl-muted mb-10">
          Build a safer workplace with Petrolord HSE.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="accent" className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-bold rounded-full">
            <Link to="/signup">Get Started Free Now</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-pl-muted">No credit card required • Unlimited users • Cancel anytime</p>
      </div>
    </section>
  );
}