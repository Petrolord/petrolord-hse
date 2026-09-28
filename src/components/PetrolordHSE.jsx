import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import LeftNav from '@/components/LeftNav';
import MainContent from '@/components/MainContent';
import { useHSE } from '@/context/HSEContext';
import { useGlobalUI } from '@/context/GlobalUIContext';
import { useAppState } from '@/context/AppStateContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReportWizard from '@/components/hse/ReportWizard';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import ChatBot from '@/components/ai/ChatBot';
import { SignedInScope, InkRail, ThemedLoadingScreen } from '@/design/SignedInScope';
import { useThemeClass } from '@/design/themeClass';
import { isThemedModule } from '@/design/rollout';

// The signed-in layout. It opens the one design-system scope
// (SignedInScope) around the whole shell while the active module is
// migrated; on every other module it renders exactly as before
// (src/design/__tests__/shellLegacyDom.test.jsx). The rail is the fixed
// dark ink frame (InkRail) inside the scope. The Report Wizard dialog and
// its success toast are scope-aware the same way (batch 1A,
// src/components/hse/__tests__/reportingLegacyDom.test.jsx).
function PetrolordHSE() {
  const { isAuthenticated, isLoading, setActiveModule, activeModule } = useHSE();
  const { persistedModule, setPersistedModule } = useAppState();
  
  // Track initialization to prevent loop or jitter
  const initialized = useRef(false);

  // Restore state on load (Fix for page refresh / tab switch)
  useEffect(() => {
    if (!initialized.current) {
        if (persistedModule && (!activeModule || activeModule.id !== persistedModule.id)) {
          console.log('Restoring active module state from persistence:', persistedModule.label);
          setActiveModule(persistedModule);
        }
        initialized.current = true;
    }
  }, [persistedModule, setActiveModule, activeModule]);

  // Ensure persistence is up to date when module changes in current session
  useEffect(() => {
    if (activeModule && (!persistedModule || activeModule.id !== persistedModule.id)) {
        setPersistedModule(activeModule);
    }
  }, [activeModule, persistedModule, setPersistedModule]);

  const moduleId = activeModule?.id || persistedModule?.id;

  if (isLoading) {
    if (isThemedModule(moduleId)) {
      return <ThemedLoadingScreen moduleId={moduleId} label="Initializing Organization Context..." />;
    }
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 text-[#FFC107] animate-spin mb-4" />
        <p className="text-[#b0b0c0] animate-pulse">Initializing Organization Context...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SignedInScope moduleId={activeModule?.id}>
      <SignedInLayout />
    </SignedInScope>
  );
}

function SignedInLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isReportWizardOpen, closeReportWizard, triggerDashboardRefresh } = useGlobalUI();
  const { toast } = useToast();
  const tc = useThemeClass();

  const handleWizardSuccess = () => {
    closeReportWizard();
    triggerDashboardRefresh();
    toast({
      title: "Success",
      description: "Report created successfully",
      ...tc({ className: "bg-green-600 text-white border-none" }, { variant: 'success' })
    });
  };

  return (
    <div className={tc('min-h-screen bg-[var(--bg-app)] flex flex-col overflow-hidden transition-colors duration-200 relative', 'min-h-screen bg-pl-bg text-pl-text flex flex-col overflow-hidden transition-colors duration-200 relative')}>
      <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block h-full shadow-xl z-20"
            >
              <InkRail>
                <LeftNav />
              </InkRail>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={tc('flex-1 overflow-auto bg-[#151521]', 'flex-1 overflow-auto bg-pl-bg')}>
          <MainContent />
        </div>
      </div>

      <ChatBot />

      <Dialog open={isReportWizardOpen} onOpenChange={closeReportWizard}>
        <DialogContent className={tc('max-w-4xl bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)] p-0 overflow-hidden sm:max-h-[90vh] z-[100]', 'max-w-4xl p-0 overflow-hidden sm:max-h-[90vh] z-[100]')}>
          <div className={tc('max-h-[85vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent', 'max-h-[85vh] overflow-y-auto p-4 sm:p-6')}>
            <DialogHeader className="mb-6">
              <DialogTitle className={tc('text-xl font-bold text-[var(--text-primary)]', 'text-xl font-semibold')}>Create New Report</DialogTitle>
              <DialogDescription className={tc('text-[var(--text-muted)]', undefined)}>
                Submit a new observation, incident, or near miss report using the wizard below.
              </DialogDescription>
            </DialogHeader>
            
            {isReportWizardOpen && (
              <ReportWizard 
                key={isReportWizardOpen ? 'open' : 'closed'}
                onSuccess={handleWizardSuccess}
                onCancel={closeReportWizard}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className={tc('bg-[var(--bg-card)] border-t border-[var(--border-color)] py-4 px-6 transition-colors duration-200', 'bg-pl-surface border-t border-pl-border py-4 px-6 transition-colors duration-200')}>
        <p className={tc('text-center text-sm text-[var(--text-secondary)]', 'text-center text-sm text-pl-muted')}>
          © 2026 Lordsway Energy. All Rights Reserved.
        </p>
      </footer>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-[280px]"
            >
              <InkRail>
                <LeftNav onClose={() => setIsSidebarOpen(false)} />
              </InkRail>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PetrolordHSE;