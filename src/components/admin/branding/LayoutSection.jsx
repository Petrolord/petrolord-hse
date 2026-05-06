import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Layout } from 'lucide-react';

export default function LayoutSection({ settings, setSettings }) {
  const updateLayout = (key, value) => {
    // Value from slider comes as array
    const val = Array.isArray(value) ? value[0] : value;
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        layout: {
          ...prev.branding_config?.layout,
          [key]: val
        }
      },
      ...(key === 'borderRadius' ? { border_radius: `${val}px` } : {})
    }));
  };

  const layout = settings.branding_config?.layout || { borderRadius: 8, shadowIntensity: 0.5, spacingScale: 1.0 };

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5 text-[var(--accent)]"/> Layout & Components</CardTitle>
        <CardDescription>Fine-tune component appearances and spacing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Border Radius */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Border Radius</Label>
            <span className="text-xs font-mono text-[var(--text-muted)]">{layout.borderRadius}px</span>
          </div>
          <Slider 
            value={[layout.borderRadius || 8]} 
            min={0} 
            max={30} 
            step={1} 
            onValueChange={(v) => updateLayout('borderRadius', v)} 
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Square (0px)</span>
            <span>Round (30px)</span>
          </div>
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Shadow Intensity</Label>
            <span className="text-xs font-mono text-[var(--text-muted)]">{layout.shadowIntensity}</span>
          </div>
          <Slider 
            value={[layout.shadowIntensity || 0.5]} 
            min={0} 
            max={1} 
            step={0.1} 
            onValueChange={(v) => updateLayout('shadowIntensity', v)}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Flat</span>
            <span>Floating</span>
          </div>
        </div>

        {/* Spacing Scale */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Spacing Density</Label>
            <span className="text-xs font-mono text-[var(--text-muted)]">{layout.spacingScale}x</span>
          </div>
          <Slider 
            value={[layout.spacingScale || 1.0]} 
            min={0.7} 
            max={1.5} 
            step={0.05} 
            onValueChange={(v) => updateLayout('spacingScale', v)}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Compact (0.7x)</span>
            <span>Spacious (1.5x)</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}