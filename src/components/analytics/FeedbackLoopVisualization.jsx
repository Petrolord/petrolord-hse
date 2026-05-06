import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, RefreshCw, MessageSquare, Database, Brain } from 'lucide-react';

export default function FeedbackLoopVisualization() {
  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          
          <Step 
            icon={Brain} 
            title="AI Model" 
            desc="Generates predictions" 
            color="text-purple-400" 
            bg="bg-purple-500/10" 
          />
          
          <ArrowRight className="h-6 w-6 text-[#7a7a9a] rotate-90 md:rotate-0" />
          
          <Step 
            icon={MessageSquare} 
            title="User Feedback" 
            desc="Validates accuracy" 
            color="text-blue-400" 
            bg="bg-blue-500/10" 
          />
          
          <ArrowRight className="h-6 w-6 text-[#7a7a9a] rotate-90 md:rotate-0" />
          
          <Step 
            icon={Database} 
            title="Training Data" 
            desc="Aggregates new knowledge" 
            color="text-yellow-400" 
            bg="bg-yellow-500/10" 
          />
          
          <ArrowRight className="h-6 w-6 text-[#7a7a9a] rotate-90 md:rotate-0" />
          
          <Step 
            icon={RefreshCw} 
            title="Retraining" 
            desc="Improves model version" 
            color="text-green-400" 
            bg="bg-green-500/10" 
          />
          
        </div>
      </CardContent>
    </Card>
  );
}

function Step({ icon: Icon, title, desc, color, bg }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-transparent hover:border-[#ffffff20] transition-all">
      <div className={`p-4 rounded-full ${bg} ${color} ring-4 ring-black/20`}>
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-xs text-[#7a7a9a]">{desc}</p>
      </div>
    </div>
  );
}