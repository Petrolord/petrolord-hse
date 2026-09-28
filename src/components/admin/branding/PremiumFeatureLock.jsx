import React from 'react';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, CheckCircle2 } from 'lucide-react';

export default function PremiumFeatureLock({ children, fallback = null }) {
  const { isPremium } = useHSEAccess();

  if (isPremium) {
    return children;
  }

  if (fallback) return fallback;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
        <Crown className="w-32 h-32 text-pl-muted" />
      </div>
      
      <CardContent className="p-6 sm:p-8 text-center relative z-10">
        <div className="w-16 h-16 bg-pl-sunken border border-pl-border rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-pl-muted" aria-hidden="true" />
        </div>
        
        <h3 className="text-xl font-semibold text-pl-text mb-2">
          Premium Feature: Branding & Customization
        </h3>
        
        <p className="text-pl-muted max-w-md mx-auto mb-6">
          Unlock full control over your organization's look and feel. Upgrade to the Premium Plan to access advanced branding features.
        </p>

        <div className="max-w-sm mx-auto text-left mb-8 space-y-2">
          <FeatureItem>Custom Logo & Favicon</FeatureItem>
          <FeatureItem>Advanced Color Palettes</FeatureItem>
          <FeatureItem>Custom Typography & Fonts</FeatureItem>
          <FeatureItem>Login Page Branding</FeatureItem>
          <FeatureItem>Custom CSS Injection</FeatureItem>
        </div>

        <Button variant="accent" className="px-8">
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-pl-text">
      <CheckCircle2 className="w-4 h-4 text-pl-primary-text shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}