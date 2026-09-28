import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';

// Design system (wave 0 pilot): dashboard only, so theme roles directly.
// Role chips are neutral tags (a role is not a status).
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
        return <Trophy className="w-5 h-5 text-pl-accent-text" aria-label="First" />;
      case 1:
        return <Medal className="w-5 h-5 text-pl-muted" aria-label="Second" />;
      case 2:
        return <Medal className="w-5 h-5 text-pl-muted" aria-label="Third" />;
      default:
        return <span className="text-pl-muted font-semibold text-sm font-pl-mono tabular-nums">#{position + 1}</span>;
    }
  };


  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pl-accent-text" aria-hidden="true" /> Team Leaderboard
          </CardTitle>
          <CardDescription>Top performers by total points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pl-primary-text mb-4" aria-hidden="true" />
            <p className="text-pl-muted">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-pl-danger/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-pl-danger-text" aria-hidden="true" /> Leaderboard Error
          </CardTitle>
          <CardDescription className="text-pl-danger-text">Could not load leaderboard data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-pl-danger-text text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pl-accent-text" aria-hidden="true" /> Team Leaderboard
          </CardTitle>
          <CardDescription>Top performers by total points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Medal className="h-12 w-12 text-pl-muted mb-4" aria-hidden="true" />
            <p className="text-pl-muted text-sm">No leaderboard data available. Be the first to score!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl p-0 overflow-hidden flex flex-col h-full">
      <CardHeader className="p-5 border-b border-pl-border">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-4 w-4 text-pl-accent-text" aria-hidden="true" /> Team Leaderboard
        </CardTitle>
        <CardDescription>Top performers based on safety contributions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {leaderboard.map((member, index) => (
          <div
            key={member.id || member.user_id || index}
            className="flex items-center justify-between px-5 py-3 border-b border-pl-border last:border-0 hover:bg-pl-sunken/60 transition-colors"
          >
            {/* Position & Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 text-sm">
                {getMedalIcon(index)}
              </div>
              <Avatar className="h-8 w-8 border border-pl-border">
                <AvatarImage src={member.avatar || ''} />
                <AvatarFallback className="text-xs">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-pl-text truncate">
                  {member.name || 'Unknown User'}
                </p>
                <div className="flex gap-2">
                  {member.role && (
                    <Badge variant="neutral" className="mt-1">
                      {capitalize(member.role)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Points & Streak */}
            <div className="text-right">
              <p className="font-semibold text-base text-pl-text font-pl-mono tabular-nums">
                {member.total_points ? member.total_points.toLocaleString() : 0} pts
              </p>
              {member.current_streak > 0 && (
                <p className="text-xs text-pl-accent-text flex items-center gap-1 justify-end">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  {member.current_streak} day streak
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-4 p-5 border-t border-pl-border">
          <p className="text-xs text-pl-muted text-center">
            Updated daily. Points reset monthly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}