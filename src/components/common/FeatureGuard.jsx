import React from 'react';
import { useFeatureAccess } from '@/context/FeatureAccessContext';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeatureGuard({ 
  feature, 
  children, 
  fallback = null, 
  mode = 'blur' // 'hide' | 'blur' | 'disable' | 'banner'
}) {
  const { canAccessFeature, triggerUpgrade } = useFeatureAccess();
  const hasAccess = canAccessFeature(feature);

  if (hasAccess) return <>{children}</>;

  if (mode === 'hide') return null;

  if (mode === 'banner') {
    return (
      <div className="border border-[#3a3a5a] bg-[#1f1f35] rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-[#252541] rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-[#FFC107]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Premium Feature Locked</h3>
        <p className="text-[#b0b0c0] mb-4 max-w-md mx-auto">
          Upgrade to Petrolord Suite to access {feature?.replace(/_/g, ' ')} and other advanced capabilities.
        </p>
        <Button 
          onClick={() => triggerUpgrade(feature)}
          className="petrolord-button"
        >
          Unlock Feature
        </Button>
      </div>
    );
  }

  if (mode === 'blur') {
    return (
      <div className="relative overflow-hidden rounded-lg group">
        <div className="filter blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#3a3a5a] shadow-2xl flex flex-col items-center text-center transform scale-95 group-hover:scale-100 transition-transform duration-200">
            <Lock className="h-8 w-8 text-[#FFC107] mb-2" />
            <h4 className="font-bold text-white">Premium Content</h4>
            <Button 
              size="sm" 
              variant="link" 
              className="text-[#FFC107] mt-1"
              onClick={() => triggerUpgrade(feature)}
            >
              Click to Unlock
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'disable') {
    // Renders children but intercepts clicks (naive implementation, best for buttons)
    return (
      <div 
        onClickCapture={(e) => { e.stopPropagation(); triggerUpgrade(feature); }} 
        className="inline-block cursor-not-allowed opacity-70 relative"
      >
        {children}
        <div className="absolute -top-2 -right-2 bg-[#FFC107] text-black rounded-full p-1 shadow-md">
          <Lock className="h-3 w-3" />
        </div>
      </div>
    );
  }

  return fallback;
}