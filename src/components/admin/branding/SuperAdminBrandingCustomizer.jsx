import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, Wand2 } from 'lucide-react';

// Customizer Tabs
import LogoTab from './SuperAdminLogoUpload';
import LoginTab from './SuperAdminLoginPageCustomizer';
import FooterTab from './SuperAdminFooterCustomizer';
import BrandingTemplates from './BrandingTemplates';

// Design family end state (batch 4B, as 4A did in the Settings branding
// editor): the Petrolord family look wins over an organisation's theme,
// colours, fonts and custom CSS, and each person picks light or dark from
// the header toggle. Those values no longer render anywhere, so the Colors,
// Typography and Advanced (custom CSS) tabs are hidden. The saved values are
// untouched: Apply Changes writes back what it loaded, and no column changes.

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
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-pl-muted">
        <Wand2 className="h-12 w-12 mb-4 opacity-40" aria-hidden="true" />
        <h3 className="text-lg font-medium text-pl-text">No Organization Selected</h3>
        <p className="max-w-xs mt-2 text-sm">Select one or more organizations from the list to start customizing their branding.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-pl-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-pl-border bg-pl-surface">
        <div>
          <h2 className="text-lg font-semibold text-pl-text">Branding Customizer</h2>
          <p className="text-xs text-pl-muted">
            Applying changes to <span className="text-pl-text font-medium font-pl-mono tabular-nums">{selectedCount}</span> organization{selectedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BrandingTemplates onApply={onApplyTemplate} currentSettings={settings} />
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="logo" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="logo">Logo & Brand</TabsTrigger>
              <TabsTrigger value="login">Login Page</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <TabsContent value="logo" className="mt-0">
              <LogoTab settings={settings} onChange={handleChange} />
            </TabsContent>
            
            <TabsContent value="login" className="mt-0">
              <LoginTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="footer" className="mt-0">
              <FooterTab settings={settings} onChange={handleChange} />
            </TabsContent>

            <Alert variant="info">
              <Info className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Colors and theme</AlertTitle>
              <AlertDescription>The workspace uses the Petrolord design family. Each person chooses light or dark from the header toggle.</AlertDescription>
            </Alert>
          </div>
        </Tabs>
      </div>
    </div>
  );
}