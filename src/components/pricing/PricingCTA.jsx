import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PricingCTA() {
  return (
    <div className="w-full bg-[#151525] border-t border-[#3a3a5a] py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to prioritize safety?</h2>
        <p className="text-xl text-[#b0b0c0] mb-10 max-w-2xl mx-auto">
          Start with our Free tier today. No credit card required. Upgrade anytime as your organization grows.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/signup">
            <Button className="h-14 px-10 text-lg bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold rounded-full shadow-[0_0_20px_rgba(255,193,7,0.3)]">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="h-14 px-10 text-lg border-[#3a3a5a] text-white hover:bg-[#3a3a5a] rounded-full">
              Contact Sales
            </Button>
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-[#7a7a9a]">
          Have questions? <a href="mailto:support@petrolord.com" className="text-[#FFC107] hover:underline">Chat with our team</a>.
        </p>
      </div>
    </div>
  );
}