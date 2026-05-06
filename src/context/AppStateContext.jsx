import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loadState, saveState } from '@/utils/stateStorage';
import { initPageVisibility } from '@/utils/pageVisibility';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  // Sidebar Collapse State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = loadState('petrolord_sidebar_collapsed');
    return saved !== undefined ? saved : false;
  });

  // Active Module Persistence (Fix for Page Refresh)
  const [persistedModule, setPersistedModule] = useState(() => {
    return loadState('petrolord_active_module') || null;
  });

  // Generic Page State (Filters, Search, Forms)
  const [pageState, setPageState] = useState(() => {
    return loadState('petrolord_page_state') || {};
  });

  // Refs to hold latest state for visibility callbacks to avoid closure staleness
  const stateRef = useRef({ sidebarCollapsed, persistedModule, pageState });

  useEffect(() => {
    stateRef.current = { sidebarCollapsed, persistedModule, pageState };
  }, [sidebarCollapsed, persistedModule, pageState]);

  // Persistence Effects - Save on change
  useEffect(() => {
    saveState('petrolord_sidebar_collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    saveState('petrolord_active_module', persistedModule);
  }, [persistedModule]);

  useEffect(() => {
    saveState('petrolord_page_state', pageState);
  }, [pageState]);

  // Page Visibility Handling - Ensure state is saved when tab is hidden/switched
  useEffect(() => {
    const cleanup = initPageVisibility({
      onHidden: () => {
        // Force save current state when user switches tabs
        console.log('Tab hidden: ensuring state persistence');
        saveState('petrolord_sidebar_collapsed', stateRef.current.sidebarCollapsed);
        saveState('petrolord_active_module', stateRef.current.persistedModule);
        saveState('petrolord_page_state', stateRef.current.pageState);
      },
      onVisible: () => {
        console.log('Tab visible: checking state integrity');
        // Optionally refresh sensitive data here if needed
        // For UI state, usually no action needed as React state is preserved in memory
      }
    });
    return cleanup;
  }, []);

  // Actions
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const setPageData = (key, data) => {
    setPageState((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const getPageData = (key) => {
    return pageState[key];
  };

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    persistedModule,
    setPersistedModule,
    pageState,
    setPageData,
    getPageData,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};