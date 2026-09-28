import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useActiveTheme } from '@/design/activeTheme';

// Mounted at the app root, outside every scope. It takes the theme of the
// scope on screen (as the toaster does), light where none is mounted (the
// homepage). The status always carries its word, Online or Offline.
const PILL = {
  online: 'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-pl-success/40 bg-pl-surface/90 px-3 py-1.5 text-pl-success-text shadow-pl-md backdrop-blur-sm transition-all duration-300',
  offline: 'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-pl-danger/60 bg-pl-danger-bg px-3 py-1.5 text-pl-danger-text shadow-pl-md transition-all duration-300',
};

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const active = useActiveTheme() || 'light';

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
    <div data-pl-theme={active} data-testid="offline-indicator" className={isOnline ? PILL.online : PILL.offline}>
      {isOnline ? <Wifi className="h-3 w-3" aria-hidden="true" /> : <WifiOff className="h-3 w-3" aria-hidden="true" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}