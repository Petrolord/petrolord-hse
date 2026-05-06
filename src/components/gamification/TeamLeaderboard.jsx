import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';

export default function TeamLeaderboard({ organizationId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (organizationId) {
      loadLeaderboard();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  const loadLeaderboard = async () => {
    try {
      console.log('🏆 [LEADERBOARD] Loading team leaderboard for org:', organizationId);
      setLoading(true);
      setError(null);

      const data = await gamificationService.getLeaderboard(organizationId);
      console.log('✅ [LEADERBOARD] Leaderboard loaded:', data);
      setLeaderboard(data || []);
    } catch (err) {
      console.error('❌ [LEADERBOARD] Error loading leaderboard:', err);
      setError('Unable to load leaderboard at this time.');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe capitalize function
  const capitalize = (str) => {
    if (!str || typeof str !== 'string') {
      return 'Unknown';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  };

  // Get medal icon based on position
  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-gray-400 font-semibold text-sm">#{position + 1}</span>;
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    if (!role || typeof role !== 'string') {
      return 'bg-gray-700 text-gray-100';
    }

    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'admin':
      case 'org_admin':
      case 'super_admin':
        return 'bg-red-900 text-red-100';
      case 'manager':
        return 'bg-blue-900 text-blue-100';
      case 'safety_officer':
        return 'bg-purple-900 text-purple-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#252541] border-[#3a3a5a] text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FFC107]" /> Team Leaderboard
          </CardTitle>
          <CardDescription className="text-[#b0b0c0]">Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#FFC107] mb-4" />
            <p className="text-[#b0b0c0]">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#252541] border-red-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" /> Leaderboard Error
          </CardTitle>
          <CardDescription className="text-red-300">Could not load leaderboard data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="bg-[#252541] border-[#3a3a5a] text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FFC107]" /> Team Leaderboard
          </CardTitle>
          <CardDescription className="text-[#b0b0c0]">Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Medal className="h-12 w-12 text-[#7a7a9a] mb-4" />
            <p className="text-[#b0b0c0] text-sm">No leaderboard data available. Be the first to score!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#252541] border-[#3a3a5a] rounded-xl p-0 shadow-lg overflow-hidden flex flex-col h-full">
      <CardHeader className="p-5 border-b border-[#3a3a5a]">
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#FFC107]" /> Team Leaderboard
        </CardTitle>
        <CardDescription className="text-[#b0b0c0]">Top performers based on safety contributions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {leaderboard.map((member, index) => (
          <div
            key={member.id || member.user_id || index}
            className="flex items-center justify-between px-5 py-3 border-b border-[#3a3a5a] last:border-0 hover:bg-[#2a2a4a] transition-colors"
          >
            {/* Position & Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 text-sm">
                {getMedalIcon(index)}
              </div>
              <Avatar className="h-8 w-8 border border-[#3a3a5a]">
                <AvatarImage src={member.avatar || ''} />
                <AvatarFallback className="text-xs bg-[#1a1a2e] text-white">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {member.name || 'Unknown User'}
                </p>
                <div className="flex gap-2">
                  {member.role && (
                    <Badge className={`${getRoleColor(member.role)} mt-1`}>
                      {capitalize(member.role)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Points & Streak */}
            <div className="text-right">
              <p className="font-bold text-base text-[#FFC107]">
                {member.total_points ? member.total_points.toLocaleString() : 0} pts
              </p>
              {member.current_streak > 0 && (
                <p className="text-xs text-orange-400 flex items-center gap-1 justify-end">
                  <Zap className="h-3 w-3" />
                  {member.current_streak} day streak
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-4 p-5 border-t border-[#3a3a5a]">
          <p className="text-xs text-[#7a7a9a] text-center">
            Updated daily • Points reset monthly
          </p>
        </div>
      </CardContent>
    </Card>
  );
}