import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { pricingTiers, professionalPricing } from './data';
import { cn } from '@/lib/utils';

export default function PricingCards({ isAnnual }) {
  const [sliderValue, setSliderValue] = useState([0]); // Index for professionalPricing array

  const proTierIndex = sliderValue[0];
  const proDetails = professionalPricing[proTierIndex];
  
  const getPrice = (tier) => {
    if (tier.id === 'free') return { amount: 0, period: '/mo' };
    if (tier.id === 'enterprise') return { amount: 'Custom', period: '' };
    
    // Professional Logic
    const amount = isAnnual ? proDetails.annual : proDetails.monthly;
    return { amount: `$${amount}`, period: '/mo' };
  };

  const getSubtext = (tier) => {
    if (tier.id === 'professional') {
        if (isAnnual) return `Billed $${proDetails.annual * 12} yearly`;
        return `Billed monthly`;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 relative z-10">
      <TooltipProvider>
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={cn(
              "bg-[#1f1f35] border-[#3a3a5a] text-white flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:shadow-black/40",
              tier.highlight && "border-[#FFC107] shadow-xl shadow-yellow-900/10 scale-105 z-20"
            )}
          >
            {tier.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-[#FFC107] text-[#1a1a2e] hover:bg-[#FFD54F] font-bold px-4 py-1 text-sm uppercase">
                  Most Popular
                </Badge>
              </div>
            )}
            
            {/* Special Badge for Free Tier */}
            {tier.specialBadge && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4">
                <span className="inline-block bg-emerald-500/90 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide shadow-lg whitespace-nowrap">
                  {tier.specialBadge}
                </span>
              </div>
            )}

            <CardHeader className="text-center pt-10">
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <CardDescription className="text-[#b0b0c0] min-h-[40px] flex items-center justify-center">{tier.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="text-5xl font-extrabold text-white mb-2">
                  {getPrice(tier).amount}
                  <span className="text-lg font-normal text-[#7a7a9a]">{getPrice(tier).period}</span>
                </div>
                {getSubtext(tier) && (
                    <div className="text-xs text-[#7a7a9a] font-medium">
                        {getSubtext(tier)}
                    </div>
                )}
              </div>

              {/* Professional Tier Slider */}
              {tier.id === 'professional' && (
                <div className="w-full mb-8 bg-[#151525] p-4 rounded-lg border border-[#3a3a5a]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-[#b0b0c0]">Team Size:</span>
                    <span className="font-bold text-[#FFC107]">{proDetails.label} Users</span>
                  </div>
                  <Slider 
                    value={sliderValue} 
                    onValueChange={setSliderValue} 
                    max={professionalPricing.length - 1} 
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5a5a7a] mt-2 px-1">
                    <span>1</span>
                    <span>5000+</span>
                  </div>
                </div>
              )}

              <div className="w-full space-y-3">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <div className="mr-3 p-1 rounded-full bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-[#e0e0e0]">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pb-8">
              <Button 
                className={cn(
                  "w-full h-12 text-lg font-semibold",
                  tier.highlight 
                    ? "bg-[#FFC107] text-[#1a1a2e] hover:bg-[#FFD54F]" 
                    : "bg-[#252541] text-white hover:bg-[#2f2f4d] border border-[#3a3a5a]"
                )}
                asChild
              >
                <a href={tier.href}>{tier.cta}</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </TooltipProvider>
    </div>
  );
}