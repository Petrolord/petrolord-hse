import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sun, Moon, AlertTriangle } from 'lucide-react';

export default function ColorSection({ settings, setSettings }) {
  
  const handleColorChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        colors: {
          ...prev.branding_config?.colors,
          [section]: {
            ...prev.branding_config?.colors?.[section],
            [key]: value
          }
        }
      },
      // Sync flat columns for backward compat
      ...(section === 'brand' && key === 'primary' ? { primary_color: value } : {}),
      ...(section === 'brand' && key === 'secondary' ? { secondary_color: value } : {}),
      ...(section === 'brand' && key === 'accent' ? { accent_color: value } : {})
    }));
  };

  const ColorInput = ({ label, value, onChange, description }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</Label>
      <div className="flex gap-3 items-center">
        <div className="relative h-10 w-12 rounded-md overflow-hidden border border-[var(--border-color)] shadow-sm">
          <Input 
            type="color" 
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer" 
          />
        </div>
        <Input 
           value={value || ''}
           onChange={(e) => onChange(e.target.value)}
           className="font-mono uppercase bg-[var(--bg-app)] border-[var(--border-color)] h-10"
           placeholder="#000000"
        />
      </div>
      {description && <p className="text-[10px] text-[var(--text-muted)]">{description}</p>}
    </div>
  );

  const colors = settings.branding_config?.colors || {};

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-[var(--accent)]"/> Color Palette</CardTitle>
        <CardDescription>Define your brand identity and interface colors.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="brand" className="w-full">
          <TabsList className="bg-[var(--bg-app)] border border-[var(--border-color)] w-full justify-start h-auto p-1 mb-6">
            <TabsTrigger value="brand" className="data-[state=active]:bg-[var(--bg-card)] py-2">Brand Colors</TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-[var(--bg-card)] py-2">Status & Alerts</TabsTrigger>
            <TabsTrigger value="light" className="data-[state=active]:bg-[var(--bg-card)] py-2"><Sun className="w-3 h-3 mr-2"/>Light Mode</TabsTrigger>
            <TabsTrigger value="dark" className="data-[state=active]:bg-[var(--bg-card)] py-2"><Moon className="w-3 h-3 mr-2"/>Dark Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50">
            <ColorInput 
              label="Primary Color" 
              value={colors.brand?.primary} 
              onChange={(v) => handleColorChange('brand', 'primary', v)}
              description="Main headings, active states, key links."
            />
            <ColorInput 
              label="Secondary Color" 
              value={colors.brand?.secondary} 
              onChange={(v) => handleColorChange('brand', 'secondary', v)}
              description="Sidebars, footers, secondary backgrounds."
            />
            <ColorInput 
              label="Accent Color" 
              value={colors.brand?.accent} 
              onChange={(v) => handleColorChange('brand', 'accent', v)}
              description="Buttons, CTAs, highlights."
            />
          </TabsContent>

          <TabsContent value="status" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50">
            <ColorInput label="Success" value={colors.status?.success} onChange={(v) => handleColorChange('status', 'success', v)} />
            <ColorInput label="Warning" value={colors.status?.warning} onChange={(v) => handleColorChange('status', 'warning', v)} />
            <ColorInput label="Error" value={colors.status?.error} onChange={(v) => handleColorChange('status', 'error', v)} />
          </TabsContent>

          <TabsContent value="light" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50">
            <ColorInput label="App Background" value={colors.light?.background} onChange={(v) => handleColorChange('light', 'background', v)} />
            <ColorInput label="Card Background" value={colors.light?.card} onChange={(v) => handleColorChange('light', 'card', v)} />
            <ColorInput label="Primary Text" value={colors.light?.textPrimary} onChange={(v) => handleColorChange('light', 'textPrimary', v)} />
            <ColorInput label="Border Color" value={colors.light?.border} onChange={(v) => handleColorChange('light', 'border', v)} />
          </TabsContent>

          <TabsContent value="dark" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50">
            <ColorInput label="App Background" value={colors.dark?.background} onChange={(v) => handleColorChange('dark', 'background', v)} />
            <ColorInput label="Card Background" value={colors.dark?.card} onChange={(v) => handleColorChange('dark', 'card', v)} />
            <ColorInput label="Primary Text" value={colors.dark?.textPrimary} onChange={(v) => handleColorChange('dark', 'textPrimary', v)} />
            <ColorInput label="Border Color" value={colors.dark?.border} onChange={(v) => handleColorChange('dark', 'border', v)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}