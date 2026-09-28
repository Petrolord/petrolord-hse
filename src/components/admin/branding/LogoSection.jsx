import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function LogoSection({ settings, setSettings, onUpload, onDelete }) {
  const logoInputRef = useRef(null);
  const secLogoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const LogoUploader = ({ type, label, description, currentUrl, inputRef, accept = "image/*" }) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div 
        className="h-40 border-2 border-dashed border-pl-border-strong rounded-lg flex flex-col items-center justify-center bg-pl-sunken relative group cursor-pointer overflow-hidden transition-colors hover:border-pl-primary"
        onClick={() => !currentUrl && inputRef.current?.click()}
      >
        {currentUrl ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img src={currentUrl} alt={label} className="max-h-full max-w-full object-contain" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>Change</Button>
              <Button size="sm" variant="destructive" aria-label={`Remove ${label}`} onClick={(e) => { e.stopPropagation(); onDelete(type); }}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-pl-muted p-4">
            <Upload className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
            <span className="text-xs block">Click to upload</span>
            <span className="text-[10px]">Max 2 MB</span>
          </div>
        )}
      </div>
      <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={(e) => onUpload(e, type)} />
      <p className="text-xs text-pl-muted">{description}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-pl-muted" aria-hidden="true"/> Logo Management</CardTitle>
        <CardDescription>Upload your brand assets. Recommended PNG or SVG with transparent background.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <LogoUploader 
            type="logo" 
            label="Primary Logo" 
            description="Used in top navigation and reports." 
            currentUrl={settings.logo_url} 
            inputRef={logoInputRef} 
          />
          <LogoUploader 
            type="secondary" 
            label="Secondary Logo" 
            description="Used on light backgrounds or dark mode if different." 
            currentUrl={settings.secondary_logo_url} 
            inputRef={secLogoInputRef} 
          />
          <LogoUploader 
            type="favicon" 
            label="Favicon" 
            description="Browser tab icon (32x32px recommended)." 
            currentUrl={settings.favicon_url} 
            inputRef={faviconInputRef} 
            accept="image/x-icon,image/png"
          />
        </div>
      </CardContent>
    </Card>
  );
}