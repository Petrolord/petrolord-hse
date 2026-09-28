import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PricingToggle({ isAnnual, setIsAnnual }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-12">
      <Label 
        className={`text-lg cursor-pointer ${!isAnnual ? 'text-pl-text font-bold' : 'text-pl-muted'}`}
        onClick={() => setIsAnnual(false)}
      >
        Monthly Billing
      </Label>
      
      <Switch 
        checked={isAnnual} 
        onCheckedChange={setIsAnnual}
        aria-label="Annual billing"
      />
      
      <div className="flex items-center gap-2">
        <Label 
          className={`text-lg cursor-pointer ${isAnnual ? 'text-pl-text font-bold' : 'text-pl-muted'}`}
          onClick={() => setIsAnnual(true)}
        >
          Annual Billing
        </Label>
        <span className="inline-block bg-pl-accent/15 text-pl-accent-text text-xs font-bold px-2 py-1 rounded-full border border-pl-accent/40">
          Save ~10%
        </span>
      </div>
    </div>
  );
}