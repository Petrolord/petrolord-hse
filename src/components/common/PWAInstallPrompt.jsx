import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveTheme } from '@/design/activeTheme';
import { FixedTheme } from '@/design/ThemeProvider';

// Mounted at the app root, outside every scope. The prompt takes the theme
// of the scope on screen (as the toaster does), light where none is mounted
// (the homepage), with the gold accent button.

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const active = useActiveTheme() || 'light';

  useEffect(() => {
    // Check for iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      // Show iOS instructions once per session or use localstorage to debounce
      const hasSeenIOSPrompt = sessionStorage.getItem('hasSeenIOSPrompt');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Standard PWA Prompt (Android/Desktop)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) sessionStorage.setItem('hasSeenIOSPrompt', 'true');
  };

  const prompt = (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          data-pl-theme={active}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-pl-raised text-pl-text border border-pl-border p-4 rounded-xl shadow-pl-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="bg-pl-accent p-2 rounded-lg text-pl-accent-fg">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-pl-text text-sm">Install Petrolord App</h3>
                <p className="text-xs text-pl-muted mt-1">
                  Install the app for a faster experience and offline access.
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} aria-label="Dismiss" className="rounded-md text-pl-muted hover:text-pl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isIOS ? (
            <div className="mt-4 text-xs text-pl-text bg-pl-sunken border border-pl-border p-3 rounded-lg">
              <p className="flex items-center gap-2 mb-2">
                1. Tap the <Share className="h-4 w-4" /> Share button
              </p>
              <p className="flex items-center gap-2">
                2. Select <span className="font-semibold border border-pl-border-strong rounded px-1">+ Add to Home Screen</span>
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleInstall} 
              variant="accent"
              className="w-full mt-4 font-semibold"
            >
              Install Now
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return <FixedTheme theme={active}>{prompt}</FixedTheme>;
}
