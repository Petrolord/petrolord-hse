import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from 'lucide-react';

// Customizer Tabs
import LogoTab from './SuperAdminLogoUpload';
import ColorsTab from './SuperAdminColorCustomizer';
import TypographyTab from './SuperAdminTypographyCustomizer';
import LoginTab from './SuperAdminLoginPageCustomizer';
import FooterTab from './SuperAdminFooterCustomizer';
import AdvancedTab from './SuperAdminAdvancedCSSEditor';
import BrandingTemplates from './BrandingTemplates';

export default function SuperAdminBrandingCustomizer({ 
  settings, 
  setSettings, 
  onSave, 
  onApplyTemplate, 
  isLoading,
  selectedCount
}) {
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (selectedCount === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
        <Wand2 className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-gray-300">No Organization Selected</h3>
        <p className="max-w-xs mt-2 text-sm">Select one or more organizations from the list to start customizing their branding.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#111827]">
      <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
        <div>
          <h2 className="text-lg font-semibold text-white">Branding Customizer</h2>
          <p className="text-xs text-gray-400">
            Applying changes to <span className="text-blue-400 font-medium">{selectedCount}</span> organization{selectedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <BrandingTemplates onApply={onApplyTemplate} currentSettings={settings} />
          <Button onClick={onSave} disabled={isLoading} className="petrolord-button">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="logo" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="bg-[#252541] border border-[#3a3a5a] w-full justify-start overflow-x-auto">
              <TabsTrigger value="logo">Logo & Brand</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="login">Login Page</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <TabsContent value="logo" className="mt-0">
              <LogoTab settings={settings} onChange={handleChange} />
            </TabsContent>
            
            <TabsContent value="colors" className="mt-0">
              <ColorsTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="typography" className="mt-0">
              <TypographyTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="login" className="mt-0">
              <LoginTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="footer" className="mt-0">
              <FooterTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              <AdvancedTab settings={settings} onChange={handleChange} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}