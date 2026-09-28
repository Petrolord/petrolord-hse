import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useActiveTheme } from '@/design/activeTheme';

// Mounted at the app root, outside every scope. While a themed screen is on
// screen it takes that screen's theme (as the toaster does); elsewhere it
// renders its legacy pill exactly as before (rootLegacyDom.test.jsx). The
// status always carries its word, Online or Offline.
const THEMED_PILL = {
  online: 'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-pl-success/40 bg-pl-surface/90 px-3 py-1.5 text-pl-success-text shadow-pl-md backdrop-blur-sm transition-all duration-300',
  offline: 'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-pl-danger/60 bg-pl-danger-bg px-3 py-1.5 text-pl-danger-text shadow-pl-md transition-all duration-300',
};

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const active = useActiveTheme();

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

  if (active) {
    return (
      <div data-pl-theme={active} data-testid="offline-indicator" className={isOnline ? THEMED_PILL.online : THEMED_PILL.offline}>
        {isOnline ? <Wifi className="h-3 w-3" aria-hidden="true" /> : <WifiOff className="h-3 w-3" aria-hidden="true" />}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

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