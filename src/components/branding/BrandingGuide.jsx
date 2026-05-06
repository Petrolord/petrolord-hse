import React from 'react';

// Branding constants
export const PETROLORD_COLORS = {
  primary: '#1e40af',      // Blue - Primary Action
  secondary: '#FCD34D',    // Gold/Yellow - Brand Identity
  accent: '#22C55E',       // Green - Safety/Success
  dark: '#1e3a8a',         // Dark Blue - Backgrounds/Headers
  light: '#f0f4ff',        // Light Blue - Backgrounds
  danger: '#ef4444',       // Red - Critical/Danger
  warning: '#f59e0b',      // Orange - Warning/Caution
  text: {
    primary: '#e0e0e0',    // Light Text on Dark
    secondary: '#b0b0c0',  // Muted Text
    dark: '#1a202c',       // Dark Text on Light
  }
};

export const PETROLORD_BRANDING = {
  // Using the CDN URL provided for the logo asset
  logoUrl: 'https://horizons-cdn.hostinger.com/b49b4b29-7343-48e8-91d9-c4b871e9bda0/1a7d16041054312d35ba07ca93fc4117.png',
  companyName: 'Petrolord',
  tagline: 'Oil & Gas Operations Management Platform',
  colors: PETROLORD_COLORS,
  fonts: {
    primary: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
};

/**
 * BrandingGuide Component
 * This component serves as a visual reference for the design system.
 * It is not meant to be used in the production app layout, but rather as a documentation/guide page.
 */
export default function BrandingGuide() {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg text-slate-900">
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <img src={PETROLORD_BRANDING.logoUrl} alt="Petrolord Logo" className="h-16 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{PETROLORD_BRANDING.companyName}</h1>
          <p className="text-slate-500">{PETROLORD_BRANDING.tagline}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Brand Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-100 rounded border flex flex-col items-center justify-center">
            <img src={PETROLORD_BRANDING.logoUrl} alt="Logo on Light" className="h-12 mb-4" />
            <span className="text-xs text-slate-500">Logo on Light Background</span>
          </div>
          <div className="p-6 bg-[#1a1a2e] rounded border border-slate-700 flex flex-col items-center justify-center">
            <img src={PETROLORD_BRANDING.logoUrl} alt="Logo on Dark" className="h-12 mb-4" />
            <span className="text-xs text-slate-400">Logo on Dark Background</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary Blue" color={PETROLORD_COLORS.primary} />
          <ColorSwatch name="Brand Gold" color={PETROLORD_COLORS.secondary} />
          <ColorSwatch name="Safety Green" color={PETROLORD_COLORS.accent} />
          <ColorSwatch name="Dark Navy" color={PETROLORD_COLORS.dark} />
          <ColorSwatch name="Danger Red" color={PETROLORD_COLORS.danger} />
          <ColorSwatch name="Warning Orange" color={PETROLORD_COLORS.warning} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1 - The quick brown fox</h1>
            <p className="text-xs text-slate-400">4xl / Bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Heading 2 - jumps over the lazy dog</h2>
            <p className="text-xs text-slate-400">3xl / Bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Heading 3 - Petrolord HSE Platform</h3>
            <p className="text-xs text-slate-400">2xl / Semibold</p>
          </div>
          <div>
            <p className="text-base">Body Text - This is standard body text used throughout the application for readability and clarity.</p>
            <p className="text-xs text-slate-400">Base / Regular</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({ name, color }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-20 w-full rounded shadow-sm border border-slate-200" style={{ backgroundColor: color }}></div>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-slate-500 font-mono">{color}</p>
      </div>
    </div>
  );
}