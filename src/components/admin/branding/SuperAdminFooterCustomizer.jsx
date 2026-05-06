import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SuperAdminFooterCustomizer({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Footer Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Copyright Text</Label>
            <Input 
              value={settings.custom_footer_text || ''} 
              onChange={(e) => onChange('custom_footer_text', e.target.value)}
              className="bg-[#111827] border-[#3a3a5a] text-white"
              placeholder="© 2024 Your Organization. All rights reserved."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Support Email</Label>
              <Input 
                value={settings.support_email || ''} 
                onChange={(e) => onChange('support_email', e.target.value)}
                className="bg-[#111827] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Support Phone</Label>
              <Input 
                value={settings.support_phone || ''} 
                onChange={(e) => onChange('support_phone', e.target.value)}
                className="bg-[#111827] border-[#3a3a5a] text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}