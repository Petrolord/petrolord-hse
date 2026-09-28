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
import ChatBot from '@/components/ai/ChatBot';
import { SignedInScope, InkRail, ThemedLoadingScreen } from '@/design/SignedInScope';

// The signed-in layout. It opens the one design-system scope
// (SignedInScope) around the whole shell on every module. The rail is the
// fixed dark ink frame (InkRail) inside the scope.
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

  if (isLoading) {
    return <ThemedLoadingScreen label="Initializing Organization Context..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SignedInScope>
      <SignedInLayout />
    </SignedInScope>
  );
}

// The rail is a drawer over the page below the lg breakpoint (the width at
// which the TopBar's menu button disappears and the rail sits beside the
// page). A phone or tablet opens with it closed; a desktop with it open.
const RAIL_BESIDE_PAGE_MIN_WIDTH = 1024;
function railStartsOpen() {
  if (typeof window === 'undefined' || typeof window.innerWidth !== 'number') return true;
  return window.innerWidth >= RAIL_BESIDE_PAGE_MIN_WIDTH;
}

function SignedInLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(railStartsOpen);
  const { isReportWizardOpen, closeReportWizard, triggerDashboardRefresh } = useGlobalUI();
  const { toast } = useToast();

  const handleWizardSuccess = () => {
    closeReportWizard();
    triggerDashboardRefresh();
    toast({
      title: "Success",
      description: "Report created successfully",
      ...{ variant: 'success' }
    });
  };

  return (
    <div className="min-h-screen bg-pl-bg text-pl-text flex flex-col overflow-hidden transition-colors duration-200 relative">
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

        <div className="flex-1 overflow-auto bg-pl-bg">
          <MainContent />
        </div>
      </div>

      <ChatBot />

      <Dialog open={isReportWizardOpen} onOpenChange={closeReportWizard}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden sm:max-h-[90vh] z-[100]">
          <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold">Create New Report</DialogTitle>
              <DialogDescription>
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

      <footer className="bg-pl-surface border-t border-pl-border py-4 px-6 transition-colors duration-200">
        <p className="text-center text-sm text-pl-muted">
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