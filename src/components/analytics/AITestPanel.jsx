import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

export default function AITestPanel() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("🧪 [AI TEST PANEL] Mounted successfully");
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6 my-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center animate-pulse">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-400">🧠 DIAGNOSTIC MODE: AI SYSTEM ACTIVE</h2>
            <p className="text-white/70">If you can see this, React is rendering correctly in this region.</p>
          </div>
        </div>
        
        <div className="text-right font-mono">
          <div className="text-2xl font-bold text-white flex items-center justify-end gap-2">
            <Clock className="h-5 w-5 text-red-400" />
            {new Date().toLocaleTimeString()}
          </div>
          <div className="text-red-400">
            Render Cycles: {count}
          </div>
        </div>
      </div>
      
      {!mounted && <div className="text-yellow-500 font-bold mt-2">⚠️ Component Initializing...</div>}
      {mounted && <div className="text-green-500 font-bold mt-2">✅ Component Mounted & Interactive</div>}
    </div>
  );
}