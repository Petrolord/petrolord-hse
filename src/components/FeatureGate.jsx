import React from 'react';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function FeatureGate({ feature, children, fallback = 'blocked', title = "Premium Feature" }) {
  const { canUseFeature, isPremium } = useHSEAccess();
  const { toast } = useToast();
  
  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Fallback options
  if (fallback === 'hidden') return null;

  if (fallback === 'disabled') {
    return React.cloneElement(children, { 
      disabled: true,
      onClick: (e) => {
        e.preventDefault();
        toast({
          title: "Limit Reached",
          description: `You have reached your ${feature} limit for the month. Upgrade to Premium for unlimited access.`,
          variant: "destructive"
        });
      },
      className: `${children.props.className} opacity-50 cursor-not-allowed`
    });
  }

  // Default: Blocked UI component
  return (
    <div className="w-full p-6 border border-dashed border-[#3a3a5a] rounded-lg bg-[#1a1a2e]/50 flex flex-col items-center justify-center text-center">
      <div className="p-3 bg-[#3a3a5a] rounded-full mb-3">
        <Lock className="h-6 w-6 text-[#FFC107]" />
      </div>
      <h3 className="text-[#e0e0e0] font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[#7a7a9a] mb-4 max-w-xs">
        {isPremium 
          ? `Limit reached for ${feature}.`
          : `Upgrade to Premium to unlock ${feature === 'videos' ? 'video uploads' : 'unlimited limits'}.`
        }
      </p>
      <Button variant="outline" className="border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107]/10">
        Upgrade Plan
      </Button>
    </div>
  );
}

export default FeatureGate;