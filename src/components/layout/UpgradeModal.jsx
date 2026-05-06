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
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#2f2f4d] text-white p-0 overflow-hidden gap-0">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-6 border-b border-[#3a3a5a]">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-2xl text-[#FFC107]">
              <div className="p-2 bg-[#FFC107]/10 rounded-full border border-[#FFC107]/20">
                <Star className="fill-[#FFC107] text-[#FFC107] h-5 w-5" />
              </div>
              Upgrade to HSE Premium
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-base">
              Unlock the full power of Petrolord HSE for your organization.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Pricing Banner */}
          <div className="flex items-center justify-between bg-[#252541] rounded-lg p-4 border border-[#3a3a5a] mb-6">
             <div>
               <h3 className="font-semibold text-white">Professional Plan</h3>
               <p className="text-xs text-gray-400">Everything in Free + Premium features</p>
             </div>
             <div className="text-right">
               <div className="flex items-baseline gap-1 justify-end">
                 <span className="text-2xl font-bold text-white">$499</span>
                 <span className="text-xs text-gray-400">/mo</span>
               </div>
               <p className="text-[10px] text-emerald-400">Billed annually</p>
             </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="mt-1">
                    <div className="bg-[#252541] p-1.5 rounded-md border border-[#3a3a5a]">
                      <Icon className="h-4 w-4 text-[#FFC107]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-snug">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-gray-500 mb-2">
            Instant activation. 14-day money-back guarantee.
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-[#151525]">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 text-gray-400 hover:text-white hover:bg-[#252541]"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold h-11"
            >
              Upgrade Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}