import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { useTheme } from '@/context/GlobalThemeContext';
import { settingsService } from '@/services/settingsService';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, RefreshCcw, CheckCircle, Lock } from 'lucide-react';

// Subcomponents
import PremiumFeatureLock from './branding/PremiumFeatureLock';
import ThemePresets from './branding/ThemePresets';
import LogoSection from './branding/LogoSection';
import ColorSection from './branding/ColorSection';
import TypographySection from './branding/TypographySection';
import LayoutSection from './branding/LayoutSection';
import ThemePreview from './branding/ThemePreview';
import LoginPageCustomizer from './branding/LoginPageCustomizer';
import FooterCustomizer from './branding/FooterCustomizer';
import AdvancedCSSEditor from './branding/AdvancedCSSEditor';
import AuditLog from './branding/AuditLog';

const DEFAULT_CONFIG = {
  branding_config: {
    colors: {
      brand: { primary: '#FFC107', secondary: '#1a1a2e', accent: '#FFC107' },
      light: { background: '#f8f9fa', card: '#ffffff', textPrimary: '#1a202c', border: '#e2e8f0' },
      dark: { background: '#1a1a2e', card: '#252541', textPrimary: '#ffffff', border: '#3a3a5a' },
      status: { success: '#22c55e', warning: '#f59e0b', error: '#ef4444' }
    },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16 },
    layout: { borderRadius: 8, shadowIntensity: 0.5, spacingScale: 1.0 },
    login: { position: 'center', bgImage: null, bgColor: '#111827', showLogo: true },
    footer: { showPoweredBy: true },
    advanced: { customCss: '' }
  },
  logo_url: null,
  secondary_logo_url: null,
  favicon_url: null
};

export default function BrandingTheme() {
  const { currentOrganization, currentUser } = useHSE();
  const { updateOrgSettings } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (currentOrganization) {
      loadSettings();
    }
  }, [currentOrganization]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getOrgSettings(currentOrganization.id);
      if (data) {
        // Deep merge logic to ensure structure
        const config = data.branding_config || {};
        setSettings({
          ...data,
          branding_config: {
            colors: {
              ...DEFAULT_CONFIG.branding_config.colors,
              ...config.colors,
              brand: { ...DEFAULT_CONFIG.branding_config.colors.brand, ...config.colors?.brand },
              light: { ...DEFAULT_CONFIG.branding_config.colors.light, ...config.colors?.light },
              dark: { ...DEFAULT_CONFIG.branding_config.colors.dark, ...config.colors?.dark },
            },
            typography: { ...DEFAULT_CONFIG.branding_config.typography, ...config.typography },
            layout: { ...DEFAULT_CONFIG.branding_config.layout, ...config.layout },
            login: { ...DEFAULT_CONFIG.branding_config.login, ...config.login },
            footer: { ...DEFAULT_CONFIG.branding_config.footer, ...config.footer },
            advanced: { ...DEFAULT_CONFIG.branding_config.advanced, ...config.advanced }
          }
        });
      } else {
        setSettings(prev => ({ ...prev, ...DEFAULT_CONFIG }));
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.upsertOrgSettings(currentOrganization.id, settings, currentUser.id);
      updateOrgSettings(settings); // Update context
      toast({ 
        title: "Settings Saved", 
        description: "Branding updated successfully.",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (newConfig) => {
    setSettings(prev => ({
      ...prev,
      branding_config: { ...prev.branding_config, ...newConfig },
      primary_color: newConfig.colors.brand.primary,
      secondary_color: newConfig.colors.brand.secondary,
      accent_color: newConfig.colors.brand.accent,
    }));
    toast({ title: "Preset Selected", description: "Click Save to apply changes." });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await settingsService.uploadLogo(currentOrganization.id, file, type === 'loginBg' ? 'login-bg' : type);
      
      if (type === 'loginBg') {
        setSettings(prev => ({
          ...prev,
          branding_config: {
            ...prev.branding_config,
            login: { ...prev.branding_config.login, bgImage: publicUrl }
          }
        }));
      } else {
        const keyMap = { 'logo': 'logo_url', 'favicon': 'favicon_url', 'secondary': 'secondary_logo_url' };
        setSettings(prev => ({ ...prev, [keyMap[type]]: publicUrl }));
      }
      toast({ title: "Uploaded", description: "Image uploaded successfully." });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteLogo = (type) => {
    const keyMap = { 'logo': 'logo_url', 'favicon': 'favicon_url', 'secondary': 'secondary_logo_url' };
    setSettings(prev => ({ ...prev, [keyMap[type]]: null }));
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="pb-20">
      <PremiumFeatureLock>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Branding & Theme</h2>
            <p className="text-[var(--text-secondary)]">Customize the look and feel of your workspace.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => loadSettings()} className="text-[var(--text-muted)]">
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset Changes
            </Button>
            <Button onClick={handleSave} disabled={saving} className="petrolord-button min-w-[140px]">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full justify-start h-auto p-1 mb-6 flex-wrap">
            <TabsTrigger value="general" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">General</TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">Colors</TabsTrigger>
            <TabsTrigger value="typography" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">Typography</TabsTrigger>
            <TabsTrigger value="login" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">Login Page</TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">Footer</TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black py-2 px-4">Advanced</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <TabsContent value="general" className="space-y-6 mt-0">
                <ThemePresets currentPreset={settings.theme_preset} onApplyPreset={applyPreset} />
                <LogoSection settings={settings} setSettings={setSettings} onUpload={handleFileUpload} onDelete={handleDeleteLogo} />
                <LayoutSection settings={settings} setSettings={setSettings} />
              </TabsContent>

              <TabsContent value="colors" className="mt-0">
                <ColorSection settings={settings} setSettings={setSettings} />
              </TabsContent>

              <TabsContent value="typography" className="mt-0">
                <TypographySection settings={settings} setSettings={setSettings} />
              </TabsContent>

              <TabsContent value="login" className="mt-0">
                <LoginPageCustomizer settings={settings} setSettings={setSettings} onUpload={handleFileUpload} />
              </TabsContent>

              <TabsContent value="footer" className="mt-0">
                <FooterCustomizer settings={settings} setSettings={setSettings} />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-0">
                <AdvancedCSSEditor settings={settings} setSettings={setSettings} />
                <AuditLog orgId={currentOrganization.id} />
              </TabsContent>

            </div>

            <div className="space-y-6">
              <ThemePreview settings={settings} />
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-400">
                <p className="font-semibold mb-1">Preview Mode</p>
                <p className="opacity-80">This preview shows a generic layout. Your actual dashboard may vary based on content.</p>
              </div>
            </div>
          </div>
        </Tabs>
      </PremiumFeatureLock>
    </div>
  );
}