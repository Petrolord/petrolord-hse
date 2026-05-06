import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, Zap, X } from 'lucide-react';
// We'll simulate confetti with CSS if library isn't available, or simple visual cues
// Assuming we don't have a confetti library installed based on package.json, we'll use a simple CSS animation

export default function QuickReportSuccess({ reportData, resultData, onClose, onNew }) {
  
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
      
      {/* Success Icon with Pulse Effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping"></div>
        <div className="relative bg-white p-4 rounded-full shadow-xl">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Report Submitted!</h2>
      <p className="text-[#b0b0c0] mb-8 max-w-md">
        Your safety observation has been successfully recorded and sent to the relevant team members.
      </p>

      {/* Report ID Card */}
      <div className="bg-[#252541] border border-[#3a3a5a] rounded-lg px-6 py-3 mb-8 inline-flex items-center gap-2">
        <span className="text-xs text-[#7a7a9a] uppercase font-bold tracking-wider">Report ID</span>
        <span className="text-lg font-mono text-[#FFC107] font-bold">{resultData?.reportId || reportData.reportId}</span>
      </div>

      {/* Gamification Rewards */}
      {resultData?.points > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8">
          <div className="bg-[#252541]/50 border border-[#3a3a5a] p-4 rounded-xl flex flex-col items-center">
            <span className="text-2xl mb-1">⭐</span>
            <span className="text-[#FFC107] font-bold text-lg">+{resultData.points}</span>
            <span className="text-xs text-[#7a7a9a]">Points Earned</span>
          </div>
          <div className="bg-[#252541]/50 border border-[#3a3a5a] p-4 rounded-xl flex flex-col items-center">
            <span className="text-2xl mb-1">🔥</span>
            <span className="text-orange-500 font-bold text-lg">{resultData.streak} Day</span>
            <span className="text-xs text-[#7a7a9a]">Streak Active</span>
          </div>
          <div className="bg-[#252541]/50 border border-[#3a3a5a] p-4 rounded-xl flex flex-col items-center">
            <span className="text-2xl mb-1">🚀</span>
            <span className="text-blue-400 font-bold text-lg">Top 10%</span>
            <span className="text-xs text-[#7a7a9a]">Team Rank</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center w-full max-w-md">
        <Button 
          onClick={() => { /* Navigate to view report */ onClose(); }} 
          className="bg-[#252541] hover:bg-[#2a2a4a] text-white border border-[#3a3a5a] flex-1"
        >
          View Report
        </Button>
        <Button 
          variant="outline" 
          className="bg-transparent border-[#3a3a5a] text-[#b0b0c0] hover:text-white hover:border-white flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
      </div>
      
      <div className="mt-4 flex gap-3 justify-center w-full max-w-md">
        <Button 
          onClick={onNew} 
          className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold flex-1"
        >
          <Zap className="h-4 w-4 mr-2 fill-current" /> Submit Another
        </Button>
        <Button 
          onClick={onClose} 
          variant="ghost" 
          className="text-[#7a7a9a] hover:text-white"
        >
          Close
        </Button>
      </div>

    </div>
  );
}