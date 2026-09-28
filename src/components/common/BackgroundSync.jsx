import { useEffect } from 'react';
import { offlineManager } from '@/lib/offlineManager';
import { useToast } from '@/components/ui/use-toast';
import { getActiveTheme } from '@/design/activeTheme';

/**
 * Invisible component to handle background sync when online
 */
export default function BackgroundSync() {
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network restored. Attempting sync...');
      // On a themed screen the toaster follows the page, so the toast takes
      // the default raised style; elsewhere it keeps its legacy blue.
      const legacyLook = getActiveTheme() ? {} : { className: "bg-blue-600 text-white border-none" };
      toast({
        title: "Back Online",
        description: "Syncing your offline data...",
        ...legacyLook
      });
      
      offlineManager.syncPendingActions().then(() => {
        // Optional: Trigger a global refresh if needed
      });
    };

    window.addEventListener('online', handleOnline);
    
    // Attempt sync on mount if online (in case app was closed offline and reopened online)
    if (navigator.onLine) {
      offlineManager.syncPendingActions();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}