import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Montserrat', 'Open Sans', 'Lato'];

export default function SuperAdminTypographyCustomizer({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Font Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Font Family</Label>
            <Select 
              value={settings.font_family || 'Inter'} 
              onValueChange={(val) => onChange('font_family', val)}
            >
              <SelectTrigger className="bg-[#111827] border-[#3a3a5a] text-white">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                {FONTS.map(f => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-gray-300">Base Font Size</Label>
              <span className="text-xs text-gray-500">{settings.font_size_base}px</span>
            </div>
            <Slider 
              value={[settings.font_size_base || 16]} 
              min={12} 
              max={20} 
              step={1} 
              onValueChange={(val) => onChange('font_size_base', val[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Component Shape</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Border Radius</Label>
            <Select 
              value={settings.border_radius || 'md'} 
              onValueChange={(val) => onChange('border_radius', val)}
            >
              <SelectTrigger className="bg-[#111827] border-[#3a3a5a] text-white">
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                <SelectItem value="none">Square (None)</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="full">Round</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}