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

  // tailwind.config.js consumes --primary / --secondary / --background /
  // --foreground as hsl(var(--x)), so they must be bare "H S% L%" triplets.
  // Branding colours arrive as hex; anything unparseable is skipped rather
  // than written (a hex written into these tokens makes them invalid and
  // every element using them renders transparent).
  const hexToHslTriplet = (hex) => {
    if (typeof hex !== 'string') return null;
    const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let hue = 0;
    let sat = 0;
    if (max !== min) {
      const d = max - min;
      sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue /= 6;
    }
    return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
  };

  const setHslToken = (root, name, hex) => {
    const triplet = hexToHslTriplet(hex);
    if (triplet) root.style.setProperty(name, triplet);
  };

  const applyGlobalStyles = (settings) => {
    const root = document.documentElement;
    
    // Apply new table columns to CSS vars
    if (settings.primary_color) setHslToken(root, '--primary', settings.primary_color);
    if (settings.secondary_color) setHslToken(root, '--secondary', settings.secondary_color);
    if (settings.accent_color) root.style.setProperty('--accent', settings.accent_color);
    if (settings.text_color) {
      root.style.setProperty('--text-primary', settings.text_color);
      setHslToken(root, '--foreground', settings.text_color);
    }
    if (settings.background_color) {
      root.style.setProperty('--bg-app', settings.background_color);
      setHslToken(root, '--background', settings.background_color);
    }
    
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
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--bg-app');
    root.style.removeProperty('--background');
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