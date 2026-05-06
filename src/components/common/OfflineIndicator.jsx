import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial state
    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`
      fixed bottom-4 left-4 z-50 rounded-full shadow-lg flex items-center px-3 py-1.5 gap-2 border transition-all duration-300
      ${isOnline ? 'bg-[#252541]/80 border-emerald-500/30 text-emerald-400' : 'bg-red-900/90 border-red-500 text-white'}
      backdrop-blur-sm
    `}>
      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}