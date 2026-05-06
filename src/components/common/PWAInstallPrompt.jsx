import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-[#1a1a2e] border border-[#FFC107]/30 p-4 rounded-xl shadow-2xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="bg-[#FFC107] p-2 rounded-lg text-black">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Install Petrolord App</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Install the app for a faster experience and offline access.
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isIOS ? (
            <div className="mt-4 text-xs text-gray-300 bg-[#252541] p-3 rounded-lg">
              <p className="flex items-center gap-2 mb-2">
                1. Tap the <Share className="h-4 w-4" /> Share button
              </p>
              <p className="flex items-center gap-2">
                2. Select <span className="font-bold border border-gray-600 rounded px-1">+ Add to Home Screen</span>
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleInstall} 
              className="w-full mt-4 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold"
            >
              Install Now
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}