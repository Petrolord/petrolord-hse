import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Star, Zap, Shield, BarChart3, Users } from 'lucide-react'
import { professionalPricing } from '@/components/pricing/data'
import { useThemeClass } from '@/design/themeClass'

// Opens from the AppSwitcher on every module. Outside a design-system scope
// it renders exactly as before (src/components/hse/__tests__/reportingLegacyDom.test.jsx);
// inside one it sits on the roles with the gold accent for the offer.

const features = [
  {
    icon: BarChart3,
    title: "Advanced AI Analytics",
    desc: "Predictive safety trends & risk forecasting"
  },
  {
    icon: Shield,
    title: "Unlimited Reporting",
    desc: "No caps on incidents, observations, or permits"
  },
  {
    icon: Users,
    title: "Enterprise Workflows",
    desc: "Custom approval chains & department hierarchy"
  },
  {
    icon: Zap,
    title: "Priority Support",
    desc: "24/7 dedicated support team access"
  }
]

export function UpgradeModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const tc = useThemeClass();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/dashboard/upgrade');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={tc('sm:max-w-[600px] bg-[#1a1a2e] border-[#2f2f4d] text-white p-0 overflow-hidden gap-0', 'sm:max-w-[600px] p-0 overflow-hidden gap-0')}>
        
        {/* Header with Gradient */}
        <div className={tc('bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-6 border-b border-[#3a3a5a]', 'bg-pl-accent/10 p-6 border-b border-pl-border')}>
          <DialogHeader className="mb-2">
            <DialogTitle className={tc('flex items-center gap-2 text-2xl text-[#FFC107]', 'flex items-center gap-2 text-2xl text-pl-text')}>
              <div className={tc('p-2 bg-[#FFC107]/10 rounded-full border border-[#FFC107]/20', 'p-2 bg-pl-accent/15 rounded-full border border-pl-accent/40')}>
                <Star className={tc('fill-[#FFC107] text-[#FFC107] h-5 w-5', 'fill-current text-pl-accent-text h-5 w-5')} />
              </div>
              Upgrade to HSE Premium
            </DialogTitle>
            <DialogDescription className={tc('text-gray-300 text-base', 'text-pl-muted text-base')}>
              Unlock the full power of Petrolord HSE for your organization.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Pricing Banner */}
          <div className={tc('flex items-center justify-between bg-[#252541] rounded-lg p-4 border border-[#3a3a5a] mb-6', 'flex items-center justify-between gap-4 bg-pl-sunken rounded-lg p-4 border border-pl-border mb-6')}>
             <div>
               <h3 className={tc('font-semibold text-white', 'font-semibold text-pl-text')}>Professional Plan</h3>
               <p className={tc('text-xs text-gray-400', 'text-xs text-pl-muted')}>Everything in Free + Premium features</p>
             </div>
             <div className="text-right">
               <div className="flex items-baseline gap-1 justify-end">
                 <span className={tc('text-xs text-gray-400', 'text-xs text-pl-muted')}>from</span>
                 <span className={tc('text-2xl font-bold text-white', 'text-2xl font-bold text-pl-text font-pl-mono tabular-nums')}>${professionalPricing[0].annual}</span>
                 <span className={tc('text-xs text-gray-400', 'text-xs text-pl-muted')}>/mo</span>
               </div>
               <p className={tc('text-[10px] text-emerald-400', 'text-[10px] text-pl-muted')}>Billed annually. Priced by team size.</p>
             </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <div className={tc('bg-[#252541] p-1.5 rounded-md border border-[#3a3a5a]', 'bg-pl-sunken p-1.5 rounded-md border border-pl-border')}>
                      <Icon className={tc('h-4 w-4 text-[#FFC107]', 'h-4 w-4 text-pl-accent-text')} />
                    </div>
                  </div>
                  <div>
                    <h4 className={tc('text-sm font-medium text-white', 'text-sm font-medium text-pl-text')}>{feature.title}</h4>
                    <p className={tc('text-xs text-gray-400 leading-snug', 'text-xs text-pl-muted leading-snug')}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={tc('text-center text-xs text-gray-500 mb-2', 'text-center text-xs text-pl-muted mb-2')}>
            Instant activation. 14-day money-back guarantee.
          </div>
        </div>

        <DialogFooter className={tc('p-6 pt-2 bg-[#151525]', 'p-6 pt-4 bg-pl-sunken border-t border-pl-border')}>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className={tc('flex-1 text-gray-400 hover:text-white hover:bg-[#252541]', 'flex-1')}
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade}
              variant={tc(undefined, 'accent')}
              className={tc('flex-1 bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold h-11', 'flex-1 font-semibold h-11')}
            >
              Upgrade Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}