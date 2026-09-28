import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuperAdminLoginPageCustomizer({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Login Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Custom Background Mode</Label>
            <Select 
              value={settings.login_page_background || 'default'} 
              onValueChange={(val) => onChange('login_page_background', val)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">System Default</SelectItem>
                <SelectItem value="custom">Custom Image</SelectItem>
                <SelectItem value="color">Solid Color</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.login_page_background === 'custom' && (
            <div className="space-y-2">
              <Label>Background Image URL</Label>
              <Input 
                value={settings.login_page_bg_url || ''} 
                onChange={(e) => onChange('login_page_bg_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-pl-border">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label>Show Powered By Badge</Label>
                <p className="text-xs text-pl-muted">Show 'Powered by Petrolord HSE' in footer</p>
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