import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pricingTiers, professionalPricing } from './data';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

export default function PricingCards({ isAnnual }) {
  const [proTierIndex, setProTierIndex] = useState(0);
  const { session } = useAuth() || {};

  const proDetails = professionalPricing[proTierIndex];
  const proPrice = isAnnual ? proDetails.annual : proDetails.monthly;
  const perUser = (proPrice / proDetails.maxUsers).toFixed(2);

  const getPrice = (tier) => {
    if (tier.id === 'free') return { amount: '$0', period: '/mo' };
    if (tier.id === 'enterprise') return { amount: 'Custom', period: '' };
    return { amount: `$${proPrice.toLocaleString()}`, period: '/mo' };
  };

  const getSubtext = (tier) => {
    if (tier.id === 'professional') {
      if (isAnnual) return `Billed $${(proDetails.annual * 12).toLocaleString()} yearly. From $${perUser} per user per month.`;
      return `Billed monthly. From $${perUser} per user per month.`;
    }
    if (tier.id === 'free') return 'Free forever. No credit card required.';
    if (tier.id === 'enterprise') return 'For teams above 5,000 users or special requirements.';
    return null;
  };

  const isInternal = (href) => href.startsWith('/');

  // Signed-in users go straight to in-app checkout instead of re-signing up.
  const resolveHref = (tier) => {
    if (session && tier.id === 'professional') return '/dashboard/upgrade';
    if (session && tier.id === 'free') return '/dashboard';
    return tier.href;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 relative z-10">
      {pricingTiers.map((tier) => (
        <Card
          key={tier.id}
          className={cn(
            "flex flex-col relative transition-shadow duration-300 hover:shadow-pl-lg",
            tier.highlight && "border-2 border-pl-accent shadow-pl-md lg:scale-105 z-20"
          )}
        >
          {tier.highlight && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="inline-block rounded-full bg-pl-accent text-pl-accent-fg font-bold px-4 py-1 text-sm uppercase whitespace-nowrap">
                Most Popular
              </span>
            </div>
          )}

          {/* Special Badge for Free Tier */}
          {tier.specialBadge && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4">
              <span className="inline-block bg-pl-raised text-pl-text border border-pl-border-strong font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide shadow-pl-sm whitespace-nowrap">
                {tier.specialBadge}
              </span>
            </div>
          )}

          <CardHeader className="text-center pt-10">
            <CardTitle className="text-2xl font-bold text-pl-text">{tier.name}</CardTitle>
            <CardDescription className="min-h-[40px] flex items-center justify-center">{tier.description}</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center">
            <div className="text-center mb-6">
              <div className={cn("text-5xl font-bold text-pl-text mb-2", getPrice(tier).amount.startsWith('$') && "font-pl-mono tabular-nums")}>
                {getPrice(tier).amount}
                <span className="font-pl-sans text-lg font-normal text-pl-muted">{getPrice(tier).period}</span>
              </div>
              {getSubtext(tier) && (
                <div className="text-xs text-pl-muted font-medium max-w-[260px] mx-auto">
                  {getSubtext(tier)}
                </div>
              )}
            </div>

            {/* Professional Tier Team Size Picker */}
            {tier.id === 'professional' && (
              <div className="w-full mb-8 bg-pl-sunken p-4 rounded-lg border border-pl-border">
                <p className="text-sm font-semibold text-pl-text mb-1 text-center">How many people are on your team?</p>
                <p className="text-xs text-pl-muted mb-4 text-center">Pick a size band. The price updates instantly.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2" role="radiogroup" aria-label="Team size">
                  {professionalPricing.map((band, i) => (
                    <button
                      key={band.label}
                      type="button"
                      role="radio"
                      aria-checked={i === proTierIndex}
                      onClick={() => setProTierIndex(i)}
                      className={cn(
                        "py-2.5 px-2 rounded-md text-xs font-semibold border transition-colors text-center",
                        i === proTierIndex
                          ? "bg-pl-primary text-pl-primary-fg border-pl-primary"
                          : "bg-pl-surface text-pl-muted border-pl-border hover:border-pl-primary/60 hover:text-pl-text"
                      )}
                    >
                      {band.label} users
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-pl-muted mt-3 text-center">
                  More than 5,000 users? The Enterprise plan is for you.
                </p>
              </div>
            )}

            <div className="w-full space-y-3">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center text-sm">
                  <div className="mr-3 p-1 rounded-full bg-pl-primary/10 text-pl-primary-text flex-shrink-0">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </div>
                  <span className="text-pl-text">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pb-8">
            <Button
              variant={tier.highlight ? 'accent' : 'outline'}
              className="w-full h-12 text-lg font-semibold"
              asChild
            >
              {isInternal(resolveHref(tier))
                ? <Link to={resolveHref(tier)}>{tier.cta}</Link>
                : <a href={resolveHref(tier)}>{tier.cta}</a>}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
