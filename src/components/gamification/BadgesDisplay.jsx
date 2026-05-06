import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BadgesDisplay() {
  const { currentUser, currentOrganization } = useHSE();
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);

  useEffect(() => {
    const loadBadges = async () => {
      if (currentUser && currentOrganization) {
        const [all, owned] = await Promise.all([
          gamificationService.getAllBadges(),
          gamificationService.getUserBadges(currentUser.id, currentOrganization.id)
        ]);
        setAllBadges(all);
        setUserBadges(owned.map(ub => ub.badge_id));
      }
    };
    loadBadges();
  }, [currentUser, currentOrganization]);

  return (
    <div className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Badges</h3>
        <span className="text-xs text-[#7a7a9a]">{userBadges.length} / {allBadges.length} Unlocked</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {allBadges.map(badge => {
          const isUnlocked = userBadges.includes(badge.id);
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`aspect-square rounded-lg flex items-center justify-center text-2xl border transition-all
                    ${isUnlocked 
                      ? 'bg-[#1a1a2e] border-[#FFC107]/30 text-white shadow-[0_0_10px_rgba(255,193,7,0.1)]' 
                      : 'bg-[#1a1a2e]/50 border-[#3a3a5a] opacity-30 grayscale'}`}
                  >
                    {badge.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                  <p className="font-bold">{badge.name}</p>
                  <p className="text-xs text-[#b0b0c0]">{badge.description}</p>
                  {!isUnlocked && <p className="text-xs text-[#FFC107] mt-1">Locked</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}