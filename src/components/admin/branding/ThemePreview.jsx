import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LayoutDashboard, Bell, Activity } from 'lucide-react';

export default function ThemePreview({ settings }) {
  const [previewMode, setPreviewMode] = useState('dark'); // 'light' or 'dark'

  const config = settings.branding_config || {};
  const colors = config.colors || {};
  const typo = config.typography || {};
  const layout = config.layout || {};

  // Resolve active colors based on preview mode
  const activeModeColors = previewMode === 'light' ? (colors.light || {}) : (colors.dark || {});
  
  // Fallbacks
  const bgApp = activeModeColors.background || (previewMode === 'dark' ? '#1a1a2e' : '#f8f9fa');
  const bgCard = activeModeColors.card || (previewMode === 'dark' ? '#252541' : '#ffffff');
  const textPrimary = activeModeColors.textPrimary || (previewMode === 'dark' ? '#ffffff' : '#1a202c');
  const borderColor = activeModeColors.border || (previewMode === 'dark' ? '#3a3a5a' : '#e2e8f0');
  
  const brandPrimary = colors.brand?.primary || '#FFC107';
  const brandAccent = colors.brand?.accent || '#FFC107';
  const radius = `${layout.borderRadius || 8}px`;
  
  const fontFamilyHead = typo.headingFont || 'Inter';
  const fontFamilyBody = typo.bodyFont || 'Inter';
  const fontSizeBase = `${typo.baseFontSize || 16}px`;
  const spacingMultiplier = layout.spacingScale || 1.0;

  // Inline styles for the preview container to isolate it
  const containerStyle = {
    backgroundColor: bgApp,
    color: textPrimary,
    fontFamily: fontFamilyBody,
    fontSize: fontSizeBase,
    transition: 'all 0.3s ease',
    // We can simulate spacing scale by adjusting padding in children or gap
  };

  const cardStyle = {
    backgroundColor: bgCard,
    borderColor: borderColor,
    borderWidth: '1px',
    borderRadius: radius,
    padding: `${16 * spacingMultiplier}px`,
    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, ${0.1 + (layout.shadowIntensity || 0) * 0.2})`
  };

  const buttonStyle = {
    backgroundColor: brandAccent,
    color: '#000',
    borderRadius: radius,
    padding: `${8 * spacingMultiplier}px ${16 * spacingMultiplier}px`,
    fontSize: `${Math.max(12, (typo.baseFontSize || 16) - 2)}px`
  };

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)] sticky top-6 overflow-hidden">
      <CardHeader className="border-b border-[var(--border-color)] pb-3 bg-[var(--bg-card)]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wider text-[var(--text-muted)]">Live Preview</CardTitle>
          <div className="flex bg-[var(--bg-app)] rounded-lg p-1 border border-[var(--border-color)]">
            <button 
              onClick={() => setPreviewMode('light')}
              className={`p-1.5 rounded ${previewMode === 'light' ? 'bg-[var(--bg-card)] shadow-sm' : 'opacity-50 hover:opacity-100'}`}
            >
              <Sun className="h-3 w-3" />
            </button>
            <button 
              onClick={() => setPreviewMode('dark')}
              className={`p-1.5 rounded ${previewMode === 'dark' ? 'bg-[var(--bg-card)] shadow-sm' : 'opacity-50 hover:opacity-100'}`}
            >
              <Moon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </CardHeader>
      
      {/* The isolated preview area */}
      <div className="min-h-[400px]" style={{ ...containerStyle, padding: `${24 * spacingMultiplier}px` }}>
        
        {/* Mock Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} className="h-8 w-auto" alt="Logo" />
            ) : (
              <div className="h-8 w-8 rounded flex items-center justify-center font-bold text-xs" style={{ backgroundColor: brandPrimary, color: '#000' }}>L</div>
            )}
            <span style={{ fontFamily: fontFamilyHead, fontWeight: 'bold', color: brandPrimary, fontSize: '1.2em' }}>Organization</span>
          </div>
          <div className="flex gap-3">
             <Bell className="h-5 w-5 opacity-70" />
             <div className="h-8 w-8 rounded-full bg-gray-400" />
          </div>
        </div>

        {/* Mock Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${16 * spacingMultiplier}px` }}>
          <h2 className="font-bold" style={{ fontFamily: fontFamilyHead, fontSize: '1.5em' }}>Dashboard Overview</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${16 * spacingMultiplier}px` }}>
            {/* Widget 1 */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-70">Total Incidents</span>
                <Activity className="h-4 w-4" style={{ color: colors.status?.error || '#ef4444' }} />
              </div>
              <div className="font-bold" style={{ fontSize: '2em' }}>12</div>
              <div className="text-xs mt-1 opacity-60">+2 from yesterday</div>
            </div>

            {/* Widget 2 */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-70">Open Permits</span>
                <LayoutDashboard className="h-4 w-4" style={{ color: colors.status?.warning || '#f59e0b' }} />
              </div>
              <div className="font-bold" style={{ fontSize: '2em' }}>5</div>
              <div className="text-xs mt-1 opacity-60">Active now</div>
            </div>
          </div>

          {/* Action Card */}
          <div style={cardStyle}>
            <h3 className="font-medium mb-2" style={{ fontFamily: fontFamilyHead, fontSize: '1.1em' }}>Quick Actions</h3>
            <p className="text-sm mb-4 opacity-70">Create a new report or manage users.</p>
            <div className="flex gap-2">
              <button 
                style={buttonStyle}
                className="transition-all hover:brightness-110 font-medium"
              >
                Create Report
              </button>
              <button 
                className="transition-all hover:bg-black/5 font-medium"
                style={{ 
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  border: `1px solid ${brandPrimary}`,
                  color: textPrimary
                }}
              >
                View Users
              </button>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
}