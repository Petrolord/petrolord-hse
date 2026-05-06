import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

export default function HazardSeverityMatrix() {
  // Simplified grid rendering
  return (
    <Card className="h-full bg-[#1a1a2e] border-[#3a3a5a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" /> 
          Hazard Severity Matrix
        </CardTitle>
        <CardDescription className="text-[#7a7a9a]">Risk categorization by Prob vs Impact</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center p-4">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full text-xs font-bold text-center text-black/70">
          
          {/* Row 1: High Severity */}
          <div className="bg-yellow-500 rounded flex items-center justify-center p-1">Medium</div>
          <div className="bg-orange-500 rounded flex items-center justify-center p-1">High</div>
          <div className="bg-red-600 text-white rounded flex items-center justify-center p-1 relative">
            Critical
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 bg-white rounded-full animate-ping"></span>
          </div>

          {/* Row 2: Medium Severity */}
          <div className="bg-green-500 rounded flex items-center justify-center p-1">Low</div>
          <div className="bg-yellow-500 rounded flex items-center justify-center p-1">Medium</div>
          <div className="bg-orange-500 rounded flex items-center justify-center p-1">High</div>

          {/* Row 3: Low Severity */}
          <div className="bg-green-500 rounded flex items-center justify-center p-1">Low</div>
          <div className="bg-green-500 rounded flex items-center justify-center p-1">Low</div>
          <div className="bg-yellow-500 rounded flex items-center justify-center p-1">Medium</div>
          
        </div>
      </CardContent>
      {/* Axis Labels could be added absolutely or via grid outer wrapper */}
    </Card>
  );
}