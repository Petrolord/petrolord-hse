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
    <Card className="border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Crown className="w-32 h-32 text-amber-500" />
      </div>
      
      <CardContent className="p-8 text-center relative z-10">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Premium Feature: Branding & Customization
        </h3>
        
        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
          Unlock full control over your organization's look and feel. Upgrade to the Premium Plan to access advanced branding features.
        </p>

        <div className="max-w-sm mx-auto text-left mb-8 space-y-2">
          <FeatureItem>Custom Logo & Favicon</FeatureItem>
          <FeatureItem>Advanced Color Palettes</FeatureItem>
          <FeatureItem>Custom Typography & Fonts</FeatureItem>
          <FeatureItem>Login Page Branding</FeatureItem>
          <FeatureItem>Custom CSS Injection</FeatureItem>
        </div>

        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      <span>{children}</span>
    </div>
  );
}