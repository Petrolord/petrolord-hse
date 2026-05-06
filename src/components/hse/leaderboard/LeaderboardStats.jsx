import React from 'react';
import { Trophy, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function LeaderboardStats({ stats }) {
  // Mock next level calc
  const nextRankPoints = Math.ceil((stats.totalPoints + 1) / 100) * 100;
  const progress = (stats.totalPoints % 100); 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-[#252541] border border-[#3a3a5a]">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Current Rank</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-white">#{stats.rank}</h3>
              <span className="text-xs text-gray-500">of {stats.totalUsers}</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252541] border border-[#3a3a5a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Total Points</p>
            <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{stats.totalPoints}</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Next Level</span>
              <span>{nextRankPoints} pts</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252541] border border-[#3a3a5a]">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Quality Score</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.qualityScore}%</h3>
            <p className="text-xs text-gray-500 mt-1">Avg per report</p>
          </div>
          <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Award className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252541] border border-[#3a3a5a]">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">This Month</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.pointsThisMonth} pts</h3>
            <p className="text-xs text-gray-500 mt-1">{stats.reportsThisMonth} reports submitted</p>
          </div>
          <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}