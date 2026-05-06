import React from 'react';
import { Medal, Star, Zap, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BADGES = {
  first_report: { icon: Star, color: 'text-yellow-400', label: 'First Report', desc: 'Submitted your first safety report' },
  quality_champion: { icon: ShieldCheck, color: 'text-green-400', label: 'Quality Champion', desc: 'Maintained >90% quality score' },
  prolific_reporter: { icon: Zap, color: 'text-blue-400', label: 'Prolific', desc: 'Submitted 10+ reports' },
  century_club: { icon: Medal, color: 'text-purple-400', label: 'Century Club', desc: 'Earned 100+ points' }
};

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
                <div className={`p-1 rounded-full bg-white/5 border border-white/10 ${def.color}`}>
                  <Icon className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                <p className="font-bold text-xs">{def.label}</p>
                <p className="text-[10px] text-gray-400">{def.desc}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}