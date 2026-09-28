import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export default function SuperAdminAdvancedCSSEditor({ settings, onChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom CSS Injection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Advanced feature: CSS entered here will be injected globally. Use with caution.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label>CSS Code</Label>
            <Textarea 
              value={settings.custom_css || ''} 
              onChange={(e) => onChange('custom_css', e.target.value)}
              aria-label="CSS code"
              className="font-pl-mono min-h-[300px]"
              placeholder=".custom-class { ... }"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}