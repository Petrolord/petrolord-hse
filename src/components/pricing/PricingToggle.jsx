import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PricingToggle({ isAnnual, setIsAnnual }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <Label 
        className={`text-lg cursor-pointer ${!isAnnual ? 'text-white font-bold' : 'text-[#7a7a9a]'}`}
        onClick={() => setIsAnnual(false)}
      >
        Monthly Billing
      </Label>
      
      <Switch 
        checked={isAnnual} 
        onCheckedChange={setIsAnnual}
        className="data-[state=checked]:bg-[#FFC107] data-[state=unchecked]:bg-[#3a3a5a]"
      />
      
      <div className="flex items-center gap-2">
        <Label 
          className={`text-lg cursor-pointer ${isAnnual ? 'text-white font-bold' : 'text-[#7a7a9a]'}`}
          onClick={() => setIsAnnual(true)}
        >
          Annual Billing
        </Label>
        <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/30">
          Save ~10%
        </span>
      </div>
    </div>
  );
}