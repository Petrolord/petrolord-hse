import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import BadgeDisplay from './BadgeDisplay';
import { ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { accountEmpty } from '@/components/account/accountChrome';

// Design family (batch 2C): the rankings table on the theme roles. The quality
// score is a status badge that carries its word (good, fair, low) beside the
// number; the trend arrow carries a word for screen readers and a title.
const EMPTY = 'n/a';
const qualityTone = (score) => (score > 80 ? ['success', 'good'] : score > 50 ? ['warning', 'fair'] : ['danger', 'low']);

export default function LeaderboardTable({ data, currentUserId }) {
  return (
    <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-pl-border bg-pl-surface">
        <h3 className="font-semibold text-pl-text">Rankings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-medium">
            <tr>
              <th className="px-4 sm:px-6 py-4 w-16">Rank</th>
              <th className="px-4 sm:px-6 py-4">Reporter</th>
              <th className="px-4 sm:px-6 py-4 text-center">Reports</th>
              <th className="px-4 sm:px-6 py-4 text-center">Quality</th>
              <th className="px-4 sm:px-6 py-4 text-right">Points</th>
              <th className="px-4 sm:px-6 py-4 w-16 text-center">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pl-border text-pl-text">
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4">
                  <div className={cn(accountEmpty, 'border-0 py-8')}>No data available for this period.</div>
                </td>
              </tr>
            ) : (
              data.map((user) => {
                const isMe = user.user_id === currentUserId;
                let rankIcon = null;
                if (user.rank === 1) rankIcon = '🥇';
                else if (user.rank === 2) rankIcon = '🥈';
                else if (user.rank === 3) rankIcon = '🥉';
                const hasQuality = user.quality_score !== null && user.quality_score !== undefined;
                const [tone, word] = qualityTone(user.quality_score);
                const rising = user.period_points > 0;

                return (
                  <tr 
                    key={user.user_id} 
                    className={`transition-colors ${isMe ? 'bg-pl-primary/10 hover:bg-pl-primary/15' : 'hover:bg-pl-sunken'}`}
                  >
                    <td className="px-4 sm:px-6 py-4 font-pl-mono tabular-nums font-bold text-pl-text">
                      {rankIcon || `#${user.rank ?? EMPTY}`}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-pl-border">
                          <AvatarImage src={user.user?.raw_user_meta_data?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {(user.user?.raw_user_meta_data?.full_name || user.user?.email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-pl-text flex items-center gap-2">
                            {user.user?.raw_user_meta_data?.full_name || 'Unknown'}
                            {isMe && <Badge variant="selected" className="text-[10px] h-4 px-1">You</Badge>}
                          </div>
                          {/* Badges placeholder - requires joining user_badges */}
                          <div className="mt-1">
                             {/* In a real app we'd join badges here, for now simpler to just not show or fetch efficiently */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-pl-mono tabular-nums">
                      {user.total_reports ?? EMPTY}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      {hasQuality ? (
                        <Badge variant={tone} className="whitespace-nowrap gap-1 rounded">
                          <span className="font-pl-mono tabular-nums">{user.quality_score}%</span> {word}
                        </Badge>
                      ) : (
                        <span className="text-pl-muted">{EMPTY}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-bold text-pl-text text-lg font-pl-mono tabular-nums">
                      {user.period_points || user.total_points}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                       {/* Simple trend logic: if they have recent points, show up */}
                       {rising ? (
                         <span title="Rising" className="inline-flex">
                           <ArrowUp className="h-4 w-4 text-pl-success-text mx-auto" aria-hidden="true" />
                           <span className="sr-only">Rising</span>
                         </span>
                       ) : (
                         <span title="No change" className="inline-flex">
                           <Minus className="h-4 w-4 text-pl-muted mx-auto" aria-hidden="true" />
                           <span className="sr-only">No change</span>
                         </span>
                       )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
