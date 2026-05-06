import React from 'react';
import { Brain, ArrowRight, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useHSE } from '@/context/HSEContext';

// This banner is designed to be impossible to miss
// It links directly to the AI Analytics module regardless of current view
export default function UniversalAIBanner() {
  const { setActiveModule } = useHSE();

  const handleNavigate = () => {
    console.log("🚀 [AI BANNER] Navigating to AI Analytics...");
    setActiveModule({ id: 'ai-analytics', label: 'AI Analytics', icon: Brain });
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-y border-purple-500/50 p-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg animate-pulse">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🧠 AI SAFETY PREDICTOR <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-extrabold uppercase">Active</span>
            </h2>
            <p className="text-purple-200 text-sm">
              Predictive models are running. Risk forecast available.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-purple-300 bg-black/20 px-3 py-1.5 rounded-full border border-purple-500/30">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span>Training Status: Ready</span>
          </div>
          <Button 
            onClick={handleNavigate}
            className="bg-white text-purple-900 hover:bg-purple-100 font-bold border-2 border-transparent hover:border-purple-300 transition-all shadow-xl"
          >
            Open AI Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}