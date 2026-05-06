import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuperAdminLoginPageCustomizer({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Login Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Custom Background Mode</Label>
            <Select 
              value={settings.login_page_background || 'default'} 
              onValueChange={(val) => onChange('login_page_background', val)}
            >
              <SelectTrigger className="w-40 bg-[#111827] border-[#3a3a5a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                <SelectItem value="default">System Default</SelectItem>
                <SelectItem value="custom">Custom Image</SelectItem>
                <SelectItem value="color">Solid Color</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.login_page_background === 'custom' && (
            <div className="space-y-2">
              <Label className="text-gray-300">Background Image URL</Label>
              <Input 
                value={settings.login_page_bg_url || ''} 
                onChange={(e) => onChange('login_page_bg_url', e.target.value)}
                className="bg-[#111827] border-[#3a3a5a] text-white"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-[#3a3a5a]">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Show Powered By Badge</Label>
                <p className="text-xs text-gray-500">Show 'Powered by Petrolord HSE' in footer</p>
              </div>
              <Switch 
                checked={settings.show_powered_by} 
                onCheckedChange={(v) => onChange('show_powered_by', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}