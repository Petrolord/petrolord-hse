import { useEffect } from 'react';
import { offlineManager } from '@/lib/offlineManager';
import { useToast } from '@/components/ui/use-toast';

/**
 * Invisible component to handle background sync when online
 */
export default function BackgroundSync() {
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network restored. Attempting sync...');
      toast({
        title: "Back Online",
        description: "Syncing your offline data...",
        className: "bg-blue-600 text-white border-none"
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