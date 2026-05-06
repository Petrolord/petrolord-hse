import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Type } from 'lucide-react';

const FONTS = [
  { value: 'Inter', label: 'Inter (Modern Sans)' },
  { value: 'Roboto', label: 'Roboto (Android Standard)' },
  { value: 'Open Sans', label: 'Open Sans (Neutral)' },
  { value: 'Lato', label: 'Lato (Friendly)' },
  { value: 'Montserrat', label: 'Montserrat (Geometric)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Merriweather', label: 'Merriweather (Serif)' },
  { value: 'Poppins', label: 'Poppins (Modern Geometric)' },
];

export default function TypographySection({ settings, setSettings }) {
  const updateTypo = (key, value) => {
    // Handle slider array value
    const val = Array.isArray(value) ? value[0] : value;
    
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        typography: {
          ...prev.branding_config?.typography,
          [key]: val
        }
      },
      // Sync flat columns
      ...(key === 'headingFont' ? { font_heading: val } : {}),
      ...(key === 'bodyFont' ? { font_body: val } : {})
    }));
  };

  const typo = settings.branding_config?.typography || {};

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-[var(--accent)]"/> Typography</CardTitle>
        <CardDescription>Choose fonts and sizing scaling.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Heading Font</Label>
            <Select value={typo.headingFont} onValueChange={(val) => updateTypo('headingFont', val)}>
              <SelectTrigger className="bg-[var(--bg-app)] border-[var(--border-color)]">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-[var(--text-muted)]">Applied to H1-H6 elements.</p>
          </div>

          <div className="space-y-3">
            <Label>Body Font</Label>
            <Select value={typo.bodyFont} onValueChange={(val) => updateTypo('bodyFont', val)}>
              <SelectTrigger className="bg-[var(--bg-app)] border-[var(--border-color)]">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-[var(--text-muted)]">Applied to paragraphs and UI text.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <Label>Base Font Size</Label>
            <span className="text-xs font-mono text-[var(--text-muted)]">{typo.baseFontSize || 16}px</span>
          </div>
          <Slider 
            value={[typo.baseFontSize || 16]} 
            min={12} 
            max={20} 
            step={1} 
            onValueChange={(v) => updateTypo('baseFontSize', v)} 
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Compact (12px)</span>
            <span>Readable (20px)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}