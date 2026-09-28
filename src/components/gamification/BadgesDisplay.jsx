import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { gamificationService } from '@/services/gamificationService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Design system (wave 0 pilot): dashboard only, so theme roles directly.
// An unlocked badge carries the gold accent edge; a locked one is dimmed
// and says so in its tooltip.
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
    <div className="h-full rounded-xl border border-pl-border bg-pl-surface p-5 shadow-pl-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-pl-text uppercase tracking-wider">Your Badges</h3>
        <span className="text-xs text-pl-muted font-pl-mono tabular-nums">{userBadges.length} / {allBadges.length} Unlocked</span>
      </div>
      {allBadges.length === 0 && (
        <p className="text-sm text-pl-muted">No badges are set up yet.</p>
      )}
      
      <div className="grid grid-cols-4 gap-3">
        {allBadges.map(badge => {
          const isUnlocked = userBadges.includes(badge.id);
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`aspect-square rounded-lg flex items-center justify-center text-2xl border transition-all
                    ${isUnlocked 
                      ? 'bg-pl-sunken border-pl-accent/60 text-pl-text' 
                      : 'bg-pl-sunken/50 border-pl-border opacity-40 grayscale'}`}
                  >
                    {badge.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs opacity-80">{badge.description}</p>
                  {!isUnlocked && <p className="text-xs mt-1 font-semibold">Locked</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}