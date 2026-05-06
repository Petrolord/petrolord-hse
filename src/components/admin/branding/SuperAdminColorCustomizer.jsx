import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SuperAdminColorCustomizer({ settings, onChange }) {
  
  const ColorInput = ({ label, propKey, description }) => (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <div className="flex gap-3">
        <div className="relative h-10 w-12 rounded overflow-hidden border border-[#3a3a5a]">
          <input 
            type="color" 
            value={settings[propKey] || '#000000'}
            onChange={(e) => onChange(propKey, e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer"
          />
        </div>
        <Input 
          value={settings[propKey] || ''}
          onChange={(e) => onChange(propKey, e.target.value)}
          className="bg-[#111827] border-[#3a3a5a] text-white font-mono"
        />
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Brand Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ColorInput 
            label="Primary Color" 
            propKey="primary_color" 
            description="Main brand color used for primary actions and highlights."
          />
          <ColorInput 
            label="Secondary Color" 
            propKey="secondary_color" 
            description="Used for sidebar, navigation, and secondary elements."
          />
          <ColorInput 
            label="Accent Color" 
            propKey="accent_color" 
            description="Used for focus states, call-to-actions, and interactive elements."
          />
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Interface Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ColorInput 
            label="Background Color" 
            propKey="background_color" 
            description="Main application background color."
          />
          <ColorInput 
            label="Text Color" 
            propKey="text_color" 
            description="Primary text color."
          />
        </CardContent>
      </Card>
    </div>
  );
}