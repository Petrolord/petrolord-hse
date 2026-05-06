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

function PetrolordHSE() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isLoading, setActiveModule, activeModule } = useHSE();
  const { isReportWizardOpen, closeReportWizard, triggerDashboardRefresh } = useGlobalUI();
  const { persistedModule, setPersistedModule } = useAppState();
  const { toast } = useToast();
  
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

  const handleWizardSuccess = () => {
    closeReportWizard();
    triggerDashboardRefresh();
    toast({
      title: "Success",
      description: "Report created successfully",
      className: "bg-green-600 text-white border-none"
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col overflow-hidden transition-colors duration-200 relative">
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
              <LeftNav />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto bg-[#151521]">
          <MainContent />
        </div>
      </div>

      <ChatBot />

      <Dialog open={isReportWizardOpen} onOpenChange={closeReportWizard}>
        <DialogContent className="max-w-4xl bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)] p-0 overflow-hidden sm:max-h-[90vh] z-[100]">
          <div className="max-h-[85vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">Create New Report</DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
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

      <footer className="bg-[var(--bg-card)] border-t border-[var(--border-color)] py-4 px-6 transition-colors duration-200">
        <p className="text-center text-sm text-[var(--text-secondary)]">
          © 2025 Lordsway Energy. All Rights Reserved.
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
              <LeftNav onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PetrolordHSE;