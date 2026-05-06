import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { supabase } from '@/lib/customSupabaseClient';

const GlobalThemeContext = createContext();

export const useTheme = () => useContext(GlobalThemeContext);

export const GlobalThemeProvider = ({ children }) => {
  const { currentOrganization } = useHSE();
  const [theme, setTheme] = useState('dark');
  const [orgLogo, setOrgLogo] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      loadSettings();
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (orgSettings) {
      applyGlobalStyles(orgSettings);
    }
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, orgSettings]);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      // Prioritize the new organization_branding table
      const { data: branding } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (branding && branding.is_branding_enabled) {
        setOrgSettings(branding);
        if (branding.theme_mode && branding.theme_mode !== 'auto') setTheme(branding.theme_mode);
        if (branding.logo_url) setOrgLogo(branding.logo_url);
        applyGlobalStyles(branding);
      } else {
        // Fallback to defaults or partial settings
        resetGlobalStyles();
        setOrgSettings(null);
        setOrgLogo(null);
      }
    } catch (error) {
      console.error("Failed to load branding", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const applyGlobalStyles = (settings) => {
    const root = document.documentElement;
    
    // Apply new table columns to CSS vars
    if (settings.primary_color) root.style.setProperty('--primary', settings.primary_color);
    if (settings.secondary_color) root.style.setProperty('--secondary', settings.secondary_color);
    if (settings.accent_color) root.style.setProperty('--accent', settings.accent_color);
    if (settings.text_color) root.style.setProperty('--text-primary', settings.text_color);
    if (settings.background_color) root.style.setProperty('--bg-app', settings.background_color);
    
    if (settings.font_family) root.style.setProperty('--font-body', settings.font_family);
    if (settings.font_family) root.style.setProperty('--font-heading', settings.font_family);
    if (settings.font_size_base) root.style.setProperty('--font-size-base', `${settings.font_size_base}px`);
    
    // Custom CSS Injection
    let styleTag = document.getElementById('petrolord-custom-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'petrolord-custom-css';
      document.head.appendChild(styleTag);
    }
    
    if (settings.custom_css) {
      styleTag.innerHTML = settings.custom_css;
    } else {
      styleTag.innerHTML = '';
    }
  };

  const resetGlobalStyles = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--bg-app');
    root.style.removeProperty('--font-body');
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--font-size-base');
    
    const styleTag = document.getElementById('petrolord-custom-css');
    if (styleTag) styleTag.innerHTML = '';
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const refreshTheme = () => loadSettings();

  return (
    <GlobalThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      orgLogo, 
      loadingSettings, 
      orgSettings, 
      refreshTheme 
    }}>
      {children}
    </GlobalThemeContext.Provider>
  );
};