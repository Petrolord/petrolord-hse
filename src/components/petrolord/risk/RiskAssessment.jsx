import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Settings } from 'lucide-react';

export default function RiskAssessment() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Risk Assessments</h2>
          <p className="text-gray-400 text-sm">Conduct qualitative and quantitative risk analysis</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Start New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40] hover:border-amber-500/50 transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="text-amber-500 group-hover:scale-110 transition-transform" /> 
              Qualitative Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Standard 5x5 matrix assessment for operational and safety risks. Uses likelihood and impact scoring.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] hover:border-blue-500/50 transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="text-blue-500 group-hover:rotate-45 transition-transform" /> 
              Bow-Tie Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Visual diagramming for high-consequence risks to identify controls and recovery measures.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] hover:border-purple-500/50 transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="text-purple-500 group-hover:scale-110 transition-transform" /> 
              Quantitative (Monte Carlo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Advanced simulation for financial and schedule risks using probability distributions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Recent Assessments</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            No assessment history available. Start a new assessment to see records here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Activity({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  )
}