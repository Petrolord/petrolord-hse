import React from 'react';
import { Medal, Star, Zap, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BADGES = {
  first_report: { icon: Star, label: 'First Report', desc: 'Submitted your first safety report' },
  quality_champion: { icon: ShieldCheck, label: 'Quality Champion', desc: 'Maintained >90% quality score' },
  prolific_reporter: { icon: Zap, label: 'Prolific', desc: 'Submitted 10+ reports' },
  century_club: { icon: Medal, label: 'Century Club', desc: 'Earned 100+ points' }
};

// Design family (batch 2C): badge chips on the theme roles; the label names
// each one (tooltip and screen reader), so no colour carries the meaning.
export default function BadgeDisplay({ userBadges = [] }) {
  if (!userBadges.length) return null;

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        {userBadges.map((badge, idx) => {
          const def = BADGES[badge.badge_id];
          if (!def) return null;
          const Icon = def.icon;
          
          return (
            <Tooltip key={idx}>
              <TooltipTrigger>
                <div className="p-1 rounded-full bg-pl-sunken border border-pl-border text-pl-primary-text">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">{def.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-xs">{def.label}</p>
                <p className="text-[10px] text-pl-muted">{def.desc}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}