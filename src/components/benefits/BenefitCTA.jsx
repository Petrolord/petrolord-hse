import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BenefitCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#1f1f35] to-[#151525] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start Your Transformation Today</h2>
        <p className="text-xl text-[#b0b0c0] mb-10">
          Join thousands of safety professionals building a safer workplace with Petrolord HSE.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button className="h-16 px-10 text-xl bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold rounded-full shadow-xl">
              Get Started Free Now
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-[#7a7a9a]">No credit card required • Unlimited users • Cancel anytime</p>
      </div>
    </section>
  );
}