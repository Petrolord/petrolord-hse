import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export default function SuperAdminAdvancedCSSEditor({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Custom CSS Injection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-900/20 border-amber-900/50 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Advanced feature: CSS entered here will be injected globally. Use with caution.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label className="text-gray-300">CSS Code</Label>
            <Textarea 
              value={settings.custom_css || ''} 
              onChange={(e) => onChange('custom_css', e.target.value)}
              className="bg-[#111827] border-[#3a3a5a] text-white font-mono min-h-[300px]"
              placeholder=".custom-class { ... }"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}