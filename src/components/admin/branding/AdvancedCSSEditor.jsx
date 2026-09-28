import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, AlertTriangle } from 'lucide-react';

export default function AdvancedCSSEditor({ settings, setSettings }) {
  const updateCSS = (value) => {
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        advanced: {
          ...prev.branding_config?.advanced,
          customCss: value
        }
      }
    }));
  };

  const customCss = settings.branding_config?.advanced?.customCss || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5 text-pl-muted" aria-hidden="true"/> Custom CSS</CardTitle>
        <CardDescription>Inject custom styles to override default platform styling. Use with caution.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription className="text-xs">
            Changes here can break the layout or accessibility of the platform. Test thoroughly. CSS is injected globally.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>CSS Editor</Label>
          <Textarea 
            className="font-pl-mono text-xs min-h-[300px] bg-pl-sunken"
            placeholder="/* Example: */
.sidebar { background: #000; }
.card { border-radius: 0; }"
            value={customCss}
            onChange={(e) => updateCSS(e.target.value)}
          />
        </div>

        <div className="text-xs text-pl-muted">
          <p className="font-semibold mb-1">Available CSS Variables:</p>
          <div className="grid grid-cols-2 gap-2 font-pl-mono">
            <span>--primary</span>
            <span>--secondary</span>
            <span>--accent</span>
            <span>--bg-app</span>
            <span>--bg-card</span>
            <span>--text-primary</span>
            <span>--radius</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}