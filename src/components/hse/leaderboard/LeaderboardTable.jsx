import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import BadgeDisplay from './BadgeDisplay';
import { ArrowUp, Minus } from 'lucide-react';

export default function LeaderboardTable({ data, currentUserId }) {
  return (
    <div className="bg-[#252541] border border-[#3a3a5a] rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
        <h3 className="font-semibold text-white">Rankings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium">
            <tr>
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Reporter</th>
              <th className="px-6 py-4 text-center">Reports</th>
              <th className="px-6 py-4 text-center">Quality</th>
              <th className="px-6 py-4 text-right">Points</th>
              <th className="px-6 py-4 w-16 text-center">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a] text-gray-300">
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No data available for this period.
                </td>
              </tr>
            ) : (
              data.map((user) => {
                const isMe = user.user_id === currentUserId;
                let rankIcon = null;
                if (user.rank === 1) rankIcon = '🥇';
                else if (user.rank === 2) rankIcon = '🥈';
                else if (user.rank === 3) rankIcon = '🥉';

                return (
                  <tr 
                    key={user.user_id} 
                    className={`transition-colors ${isMe ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-[#2d2d4a]'}`}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {rankIcon || `#${user.rank}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[#3a3a5a]">
                          <AvatarImage src={user.user?.raw_user_meta_data?.avatar_url} />
                          <AvatarFallback className="bg-[#3a3a5a] text-xs">
                            {(user.user?.raw_user_meta_data?.full_name || user.user?.email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {user.user?.raw_user_meta_data?.full_name || 'Unknown'}
                            {isMe && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-500/20 text-blue-300">You</Badge>}
                          </div>
                          {/* Badges placeholder - requires joining user_badges */}
                          <div className="mt-1">
                             {/* In a real app we'd join badges here, for now simpler to just not show or fetch efficiently */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.total_reports}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center px-2 py-1 rounded bg-[#1a1a2e] border border-[#3a3a5a] text-xs font-mono">
                        <div className={`h-2 w-2 rounded-full mr-2 ${user.quality_score > 80 ? 'bg-green-500' : user.quality_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        {user.quality_score}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white text-lg">
                      {user.period_points || user.total_points}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {/* Simple trend logic: if they have recent points, show up */}
                       {user.period_points > 0 ? <ArrowUp className="h-4 w-4 text-green-500 mx-auto" /> : <Minus className="h-4 w-4 text-gray-600 mx-auto" />}
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