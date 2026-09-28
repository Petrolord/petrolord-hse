import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SuperAdminFooterCustomizer({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Footer Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input 
              value={settings.custom_footer_text || ''} 
              onChange={(e) => onChange('custom_footer_text', e.target.value)}
              placeholder="© 2024 Your Organization. All rights reserved."
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input 
                value={settings.support_email || ''} 
                onChange={(e) => onChange('support_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input 
                value={settings.support_phone || ''} 
                onChange={(e) => onChange('support_phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}