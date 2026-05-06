import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Bell, Activity, Sun, Moon } from 'lucide-react';

export default function SuperAdminBrandingPreview({ settings }) {
  // Styles derived from settings
  const primary = settings.primary_color || '#FFC107';
  const secondary = settings.secondary_color || '#1F2937';
  const background = settings.background_color || '#111827';
  const text = settings.text_color || '#FFFFFF';
  const font = settings.font_family || 'Inter';
  const radius = settings.border_radius === 'full' ? '999px' : settings.border_radius === 'none' ? '0px' : settings.border_radius === 'lg' ? '12px' : settings.border_radius === 'sm' ? '4px' : '8px';

  return (
    <Card className="h-full flex flex-col bg-[#1a1a2e] border-[#3a3a5a] overflow-hidden">
      <CardHeader className="border-b border-[#3a3a5a] py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Live Preview</CardTitle>
          <div className="flex gap-2">
            <Sun className="h-4 w-4 text-gray-500" />
            <Moon className="h-4 w-4 text-blue-400" />
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-1 p-6 relative overflow-hidden flex items-center justify-center bg-black/20">
        {/* Mock Application Interface */}
        <div 
          className="w-full max-w-md aspect-[9/16] md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300"
          style={{ backgroundColor: background, fontFamily: font, color: text }}
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/10" style={{ backgroundColor: secondary }}>
            <div className="flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} className="h-8 w-auto" alt="Logo" />
              ) : (
                <div className="h-8 w-8 rounded flex items-center justify-center font-bold" style={{ backgroundColor: primary, color: '#000', borderRadius: radius }}>L</div>
              )}
              <span className="font-bold text-sm">Dashboard</span>
            </div>
            <Bell className="h-5 w-5 opacity-70" />
          </div>

          {/* Sidebar + Content */}
          <div className="flex flex-1 overflow-hidden">
            <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-4" style={{ backgroundColor: secondary }}>
              <div className="p-2 rounded-lg bg-white/5"><LayoutDashboard className="h-5 w-5" style={{ color: primary }} /></div>
              <div className="p-2 rounded-lg opacity-50"><Activity className="h-5 w-5" /></div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-white/5 bg-white/5" style={{ borderRadius: radius }}>
                  <p className="text-xs opacity-70 mb-1">Total Incidents</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/5" style={{ borderRadius: radius }}>
                  <p className="text-xs opacity-70 mb-1">Active Permits</p>
                  <p className="text-2xl font-bold" style={{ color: primary }}>5</p>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 rounded-lg border border-white/5 bg-white/5" style={{ borderRadius: radius }}>
                <h4 className="font-medium mb-2">Quick Action</h4>
                <button 
                  className="w-full py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: settings.accent_color || '#3B82F6', color: '#fff', borderRadius: radius }}
                >
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}