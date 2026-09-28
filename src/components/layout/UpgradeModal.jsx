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

// Opens from the AppSwitcher on every module, on the roles with the gold
// accent for the offer.

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

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/dashboard/upgrade');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        
        {/* Header with Gradient */}
        <div className="bg-pl-accent/10 p-6 border-b border-pl-border">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-2xl text-pl-text">
              <div className="p-2 bg-pl-accent/15 rounded-full border border-pl-accent/40">
                <Star className="fill-current text-pl-accent-text h-5 w-5" />
              </div>
              Upgrade to HSE Premium
            </DialogTitle>
            <DialogDescription className="text-pl-muted text-base">
              Unlock the full power of Petrolord HSE for your organization.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Pricing Banner */}
          <div className="flex items-center justify-between gap-4 bg-pl-sunken rounded-lg p-4 border border-pl-border mb-6">
             <div>
               <h3 className="font-semibold text-pl-text">Professional Plan</h3>
               <p className="text-xs text-pl-muted">Everything in Free + Premium features</p>
             </div>
             <div className="text-right">
               <div className="flex items-baseline gap-1 justify-end">
                 <span className="text-xs text-pl-muted">from</span>
                 <span className="text-2xl font-bold text-pl-text font-pl-mono tabular-nums">${professionalPricing[0].annual}</span>
                 <span className="text-xs text-pl-muted">/mo</span>
               </div>
               <p className="text-[10px] text-pl-muted">Billed annually. Priced by team size.</p>
             </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <div className="bg-pl-sunken p-1.5 rounded-md border border-pl-border">
                      <Icon className="h-4 w-4 text-pl-accent-text" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-pl-text">{feature.title}</h4>
                    <p className="text-xs text-pl-muted leading-snug">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-pl-muted mb-2">
            Instant activation. 14-day money-back guarantee.
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 bg-pl-sunken border-t border-pl-border">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade}
              variant="accent"
              className="flex-1 font-semibold h-11"
            >
              Upgrade Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}