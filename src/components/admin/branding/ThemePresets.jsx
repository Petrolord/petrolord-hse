import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check } from 'lucide-react';

const PRESETS = {
  modern: {
    label: 'Modern Petrolord',
    branding_config: {
      colors: {
        brand: { primary: '#FFC107', secondary: '#1a1a2e', accent: '#FFC107' },
        light: { background: '#f8f9fa', card: '#ffffff', textPrimary: '#1a202c', border: '#e2e8f0' },
        dark: { background: '#1a1a2e', card: '#252541', textPrimary: '#ffffff', border: '#3a3a5a' }
      },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16 },
      layout: { borderRadius: 8, shadowIntensity: 0.5, spacingScale: 1.0 }
    }
  },
  corporate: {
    label: 'Classic Corporate',
    branding_config: {
      colors: {
        brand: { primary: '#0f4c81', secondary: '#ffffff', accent: '#0f4c81' },
        light: { background: '#f0f2f5', card: '#ffffff', textPrimary: '#333333', border: '#d1d5db' },
        dark: { background: '#1e293b', card: '#374151', textPrimary: '#f9fafb', border: '#4b5563' }
      },
      typography: { headingFont: 'Merriweather', bodyFont: 'Open Sans', baseFontSize: 15 },
      layout: { borderRadius: 2, shadowIntensity: 0.2, spacingScale: 0.9 }
    }
  },
  ocean: {
    label: 'Deep Ocean',
    branding_config: {
      colors: {
        brand: { primary: '#006994', secondary: '#001f3f', accent: '#7FDBFF' },
        light: { background: '#e0f7fa', card: '#ffffff', textPrimary: '#004d40', border: '#b2ebf2' },
        dark: { background: '#001e26', card: '#004d40', textPrimary: '#e0f7fa', border: '#006064' }
      },
      typography: { headingFont: 'Montserrat', bodyFont: 'Lato', baseFontSize: 16 },
      layout: { borderRadius: 12, shadowIntensity: 0.6, spacingScale: 1.1 }
    }
  },
  nature: {
    label: 'Eco Nature',
    branding_config: {
      colors: {
        brand: { primary: '#2E8B57', secondary: '#f0fff4', accent: '#98FB98' },
        light: { background: '#f1f8e9', card: '#ffffff', textPrimary: '#1b5e20', border: '#c5e1a5' },
        dark: { background: '#1a3300', card: '#2e4c05', textPrimary: '#f1f8e9', border: '#33691e' }
      },
      typography: { headingFont: 'Lato', bodyFont: 'Open Sans', baseFontSize: 16 },
      layout: { borderRadius: 16, shadowIntensity: 0.4, spacingScale: 1.05 }
    }
  },
  tech: {
    label: 'High Tech',
    branding_config: {
      colors: {
        brand: { primary: '#6366f1', secondary: '#0f172a', accent: '#818cf8' },
        light: { background: '#f8fafc', card: '#ffffff', textPrimary: '#0f172a', border: '#e2e8f0' },
        dark: { background: '#020617', card: '#1e293b', textPrimary: '#f8fafc', border: '#334155' }
      },
      typography: { headingFont: 'Roboto', bodyFont: 'Roboto', baseFontSize: 14 },
      layout: { borderRadius: 4, shadowIntensity: 0.8, spacingScale: 0.95 }
    }
  }
};

export default function ThemePresets({ currentPreset, onApplyPreset }) {
  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)] mb-6">
      <CardContent className="pt-6">
        <Label className="mb-4 block text-sm font-semibold uppercase text-[var(--text-muted)]">Quick Theme Presets</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onApplyPreset(preset.branding_config)}
              className={`
                relative p-3 rounded-xl border text-left transition-all group overflow-hidden
                ${currentPreset === key ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-app)]'}
              `}
            >
              <div className="flex gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: preset.branding_config.colors.brand.primary }} />
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: preset.branding_config.colors.dark.background }} />
              </div>
              <span className="text-xs font-medium block truncate text-[var(--text-primary)]">{preset.label}</span>
              
              {/* Optional: Checkmark for active state if we tracked preset ID explicitly
              {currentPreset === key && (
                <div className="absolute top-2 right-2 text-[var(--accent)]">
                  <Check className="h-3 w-3" />
                </div>
              )} */}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}