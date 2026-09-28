import React from 'react';
import { Trophy, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Design family (batch 2C): stat tiles on the theme roles, numbers in the mono
// face, icons in neutral tiles (colour is kept for status). A missing value
// reads n/a.
const EMPTY = 'n/a';
const show = (v) => (v === null || v === undefined || Number.isNaN(v) ? EMPTY : v);
const iconTile = 'h-10 w-10 shrink-0 bg-pl-sunken rounded-full flex items-center justify-center';
const num = 'font-pl-mono tabular-nums';

export default function LeaderboardStats({ stats }) {
  // Mock next level calc
  const nextRankPoints = Math.ceil((stats.totalPoints + 1) / 100) * 100;
  const progress = (stats.totalPoints % 100); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pl-muted">Current Rank</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className={`text-2xl font-semibold text-pl-text ${num}`}>#{show(stats.rank)}</h3>
              <span className="text-xs text-pl-muted">of <span className={num}>{show(stats.totalUsers)}</span></span>
            </div>
          </div>
          <div className={iconTile}>
            <Trophy className="h-5 w-5 text-pl-muted" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-pl-muted">Total Points</p>
            <div className={iconTile}>
              <TrendingUp className="h-5 w-5 text-pl-muted" aria-hidden="true" />
            </div>
          </div>
          <h3 className={`text-2xl font-semibold text-pl-text mb-2 ${num}`}>{show(stats.totalPoints)}</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-pl-muted">
              <span>Next Level</span>
              <span><span className={num}>{show(nextRankPoints)}</span> pts</span>
            </div>
            <Progress value={progress} className="h-1.5" aria-label="Progress to the next level" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pl-muted">Quality Score</p>
            <h3 className={`text-2xl font-semibold text-pl-text mt-1 ${num}`}>{show(stats.qualityScore)}%</h3>
            <p className="text-xs text-pl-muted mt-1">Avg per report</p>
          </div>
          <div className={iconTile}>
            <Award className="h-5 w-5 text-pl-muted" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pl-muted">This Month</p>
            <h3 className="text-2xl font-semibold text-pl-text mt-1"><span className={num}>{show(stats.pointsThisMonth)}</span> pts</h3>
            <p className="text-xs text-pl-muted mt-1"><span className={num}>{show(stats.reportsThisMonth)}</span> reports submitted</p>
          </div>
          <div className={iconTile}>
            <Calendar className="h-5 w-5 text-pl-muted" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
