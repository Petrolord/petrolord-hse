import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Shield, Check, ChevronDown, Star, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Badge } from '@/components/ui/badge';
import { UpgradeModal } from './UpgradeModal';

const AppSwitcher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const currentPath = window.location.pathname;
  const isSuite = currentPath.startsWith('/suite');
  const isHSE = currentPath.startsWith('/dashboard');

  const primaryApp = user?.user_metadata?.primary_app;
  const subscribedModules = user?.user_metadata?.subscribed_modules || [];

  // HSE is accessible if it's primary, or in module list, or explicitly 'hse_free'
  const hasHSE = primaryApp === 'hse' || subscribedModules.includes('hse') || subscribedModules.includes('hse_free');
  
  // Detect subscription tier
  const isPremium = subscribedModules.includes('hse') || subscribedModules.includes('hse_premium');
  const isFreeUser = hasHSE && !isPremium;

  // Suite implies access to other premium modules beyond just HSE
  const hasSuite = subscribedModules.length > 1 || (subscribedModules.length === 1 && !subscribedModules.includes('hse_free'));

  const CurrentIcon = isHSE ? Shield : LayoutGrid;
  const currentLabel = isHSE ? "HSE Platform" : "Operations Suite";
  const currentColor = isHSE ? "text-emerald-400" : "text-blue-400";
  const currentBg = isHSE ? "bg-emerald-500/10 border-emerald-500/20" : "bg-blue-500/10 border-blue-500/20";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`flex items-center gap-3 h-10 px-3 ml-2 border ${currentBg} hover:bg-white/5 transition-all group`}
          >
            <div className={`p-1 rounded ${isHSE ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
              <CurrentIcon className={`h-4 w-4 ${currentColor}`} />
            </div>
            
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold leading-none mb-0.5">Current App</span>
              <span className="text-sm font-medium text-white leading-none">{currentLabel}</span>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 bg-[#1f1f35] border-[#3a3a5a] text-white p-2" align="start" alignOffset={-10}>
          <DropdownMenuLabel className="text-[#7a7a9a] text-xs uppercase tracking-wider px-2 py-1.5 mb-1">
            Switch Application
          </DropdownMenuLabel>
          
          <div className="space-y-1">
            {hasHSE && (
              <DropdownMenuItem 
                className={`cursor-pointer focus:bg-[#252541] rounded-lg p-3 group transition-colors ${isHSE ? 'bg-[#252541] border border-[#3a3a5a]' : 'hover:bg-[#252541] border border-transparent'}`}
                onClick={() => navigate('/dashboard')}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="bg-emerald-500/20 p-2 rounded-md mt-0.5">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">HSE Platform</span>
                      {isHSE && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-5">Active</Badge>}
                    </div>
                    <p className="text-xs text-[#7a7a9a] leading-snug">
                      Safety management, incident reporting, and compliance tracking.
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            )}

            {hasSuite && (
              <DropdownMenuItem 
                className={`cursor-pointer focus:bg-[#252541] rounded-lg p-3 group transition-colors ${isSuite ? 'bg-[#252541] border border-[#3a3a5a]' : 'hover:bg-[#252541] border border-transparent'}`}
                onClick={() => navigate('/suite')}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="bg-blue-500/20 p-2 rounded-md mt-0.5">
                    <LayoutGrid className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">Operations Suite</span>
                      {isSuite && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] h-5">Active</Badge>}
                    </div>
                    <p className="text-xs text-[#7a7a9a] leading-snug">
                      Unified command center for drilling, production, and reservoirs.
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            )}
          </div>

          {/* Upgrade Banner for Free Users */}
          {isFreeUser && (
             <div className="mt-2 pt-2 border-t border-[#3a3a5a]">
               <DropdownMenuItem
                 className="p-0 focus:bg-transparent cursor-pointer"
                 onSelect={(e) => {
                   e.preventDefault();
                   setShowUpgradeModal(true);
                 }}
               >
                 <div className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-3 border border-amber-500/20 hover:border-amber-500/40 hover:from-amber-500/20 hover:to-orange-500/20 transition-all group">
                   <div className="flex items-center gap-2 mb-1.5">
                     <div className="bg-amber-500/20 p-1 rounded-full">
                        <Star className="h-3.5 w-3.5 text-[#FFC107] fill-[#FFC107]" />
                     </div>
                     <span className="text-sm font-semibold text-[#FFC107]">Upgrade to Premium</span>
                   </div>
                   <p className="text-[10px] text-gray-400 group-hover:text-gray-300 leading-snug pl-1">
                     Unlock AI analytics, custom workflows, and unlimited reporting.
                   </p>
                 </div>
               </DropdownMenuItem>
             </div>
          )}

          {/* Discover Suite for Premium Users who don't have Suite yet */}
          {!hasSuite && !isFreeUser && (
             <div className="mt-2 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
               <div className="flex items-center gap-2 mb-1">
                 <LayoutGrid className="h-4 w-4 text-blue-400" />
                 <span className="text-xs font-semibold text-white">Discover Suite</span>
               </div>
               <p className="text-[10px] text-[#b0b0c0] mb-2">
                 Expand to Geoscience, Drilling, and Production modules.
               </p>
               <Button 
                 size="sm" 
                 variant="outline" 
                 className="w-full h-7 text-xs border-blue-500/30 hover:bg-blue-500/20 text-blue-200"
                 onClick={() => navigate('/pricing')}
               >
                 View Plans
               </Button>
             </div>
          )}
          
        </DropdownMenuContent>
      </DropdownMenu>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </>
  );
};

export default AppSwitcher;