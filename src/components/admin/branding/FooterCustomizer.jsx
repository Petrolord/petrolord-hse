import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PanelBottom } from 'lucide-react';

export default function FooterCustomizer({ settings, setSettings }) {
  const updateFooterConfig = (key, value) => {
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        footer: {
          ...prev.branding_config?.footer,
          [key]: value
        }
      }
    }));
  };

  const footerConfig = settings.branding_config?.footer || {};

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><PanelBottom className="h-5 w-5 text-[var(--accent)]"/> Footer Settings</CardTitle>
        <CardDescription>Customize the footer links and copyright information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="space-y-0.5">
            <Label>Show "Powered by Petrolord"</Label>
            <p className="text-xs text-[var(--text-muted)]">Display platform branding in footer</p>
          </div>
          <Switch 
            checked={footerConfig.showPoweredBy !== false}
            onCheckedChange={(v) => updateFooterConfig('showPoweredBy', v)}
          />
        </div>

        <div className="space-y-3">
          <Label>Custom Copyright Text</Label>
          <Input 
            placeholder="© 2024 Your Company Inc. All rights reserved." 
            value={footerConfig.copyrightText || ''}
            onChange={(e) => updateFooterConfig('copyrightText', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Privacy Policy URL</Label>
            <Input 
              placeholder="https://..." 
              value={footerConfig.privacyUrl || ''}
              onChange={(e) => updateFooterConfig('privacyUrl', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Terms of Service URL</Label>
            <Input 
              placeholder="https://..." 
              value={footerConfig.termsUrl || ''}
              onChange={(e) => updateFooterConfig('termsUrl', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Support Email</Label>
          <Input 
            placeholder="support@yourcompany.com" 
            value={footerConfig.supportEmail || ''}
            onChange={(e) => updateFooterConfig('supportEmail', e.target.value)}
          />
        </div>

      </CardContent>
    </Card>
  );
}