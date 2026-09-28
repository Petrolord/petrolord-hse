import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Settings } from 'lucide-react';

export default function RiskAssessment() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-pl-text">Risk Assessments</h2>
          <p className="text-pl-muted text-sm">Conduct qualitative and quantitative risk analysis</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Start New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-pl-border-strong transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-pl-muted group-hover:scale-110 transition-transform" aria-hidden="true" /> 
              Qualitative Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pl-muted text-sm">
              Standard 5x5 matrix assessment for operational and safety risks. Uses likelihood and impact scoring.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-pl-border-strong transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-pl-muted group-hover:rotate-45 transition-transform" aria-hidden="true" /> 
              Bow-Tie Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pl-muted text-sm">
              Visual diagramming for high-consequence risks to identify controls and recovery measures.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-pl-border-strong transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-pl-muted group-hover:scale-110 transition-transform" aria-hidden="true" /> 
              Quantitative (Monte Carlo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pl-muted text-sm">
              Advanced simulation for financial and schedule risks using probability distributions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      <Card>
        <CardHeader><CardTitle>Recent Assessments</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-12 text-pl-muted">
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