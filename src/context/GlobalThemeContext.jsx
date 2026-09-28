import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { supabase } from '@/lib/customSupabaseClient';

// Organisation branding (organization_branding), read only.
//
// Design family rollout batch 4A (lead decision 6, docs/scope/DesignSystem-Rollout.md
// section 7): inside the app the Petrolord family look wins over an
// organisation's theme_mode, colours, fonts and custom CSS. This provider
// no longer writes any of them to <html> (no `.dark` class, no data-theme,
// no CSS variables, no injected <style>); light or dark is the user's own
// choice from the header toggle (src/design). The branding row is still
// read and exposed (orgSettings, orgLogo) so nothing that reads it breaks;
// the database columns are unchanged.
//
// `theme` stays in the context value for old callers; it is always 'light'
// and toggleTheme is a no-op.

const GlobalThemeContext = createContext();

export const useTheme = () => useContext(GlobalThemeContext);

const noop = () => {};

export const GlobalThemeProvider = ({ children }) => {
  const { currentOrganization } = useHSE();
  const [orgLogo, setOrgLogo] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      loadSettings();
    }
  }, [currentOrganization]);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const { data: branding } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (branding && branding.is_branding_enabled) {
        setOrgSettings(branding);
        setOrgLogo(branding.logo_url || null);
      } else {
        setOrgSettings(null);
        setOrgLogo(null);
      }
    } catch (error) {
      console.error("Failed to load branding", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const refreshTheme = () => loadSettings();

  return (
    <GlobalThemeContext.Provider value={{ 
      theme: 'light', 
      toggleTheme: noop, 
      orgLogo, 
      loadingSettings, 
      orgSettings, 
      refreshTheme 
    }}>
      {children}
    </GlobalThemeContext.Provider>
  );
};
