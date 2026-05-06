import React, { createContext, useContext, useState } from 'react';

const GlobalUIContext = createContext();

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (!context) {
    throw new Error('useGlobalUI must be used within a GlobalUIProvider');
  }
  return context;
};

export const GlobalUIProvider = ({ children }) => {
  const [isReportWizardOpen, setIsReportWizardOpen] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const openReportWizard = () => {
    console.log("GlobalUI: Opening Report Wizard");
    setIsReportWizardOpen(true);
  };

  const closeReportWizard = () => {
    console.log("GlobalUI: Closing Report Wizard");
    setIsReportWizardOpen(false);
  };

  const triggerDashboardRefresh = () => {
    console.log("GlobalUI: Triggering Dashboard Refresh");
    setDashboardRefreshKey(prev => prev + 1);
  };

  return (
    <GlobalUIContext.Provider 
      value={{ 
        isReportWizardOpen, 
        openReportWizard, 
        closeReportWizard,
        dashboardRefreshKey,
        triggerDashboardRefresh
      }}
    >
      {children}
    </GlobalUIContext.Provider>
  );
};