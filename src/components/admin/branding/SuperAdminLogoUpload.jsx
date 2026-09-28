import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, Upload } from 'lucide-react';
import { superAdminBrandingService } from '@/services/superAdminBrandingService';
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminLogoUpload({ settings, onChange }) {
  const { toast } = useToast();
  const logoInput = useRef(null);
  const faviconInput = useRef(null);

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await superAdminBrandingService.uploadAsset(file, type);
      onChange(type === 'logo' ? 'logo_url' : 'favicon_url', url);
      toast({ title: "Upload Success", description: `${type} uploaded successfully.` });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Branding Status</CardTitle>
            <Switch 
              checked={settings.is_branding_enabled}
              onCheckedChange={(v) => onChange('is_branding_enabled', v)}
            />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visual Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Logo</Label>
              <div 
                className="h-32 border-2 border-dashed border-pl-border-strong rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pl-primary transition-colors bg-pl-sunken"
                onClick={() => logoInput.current?.click()}
              >
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-pl-muted">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
              <input type="file" ref={logoInput} hidden accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <div 
                className="h-32 border-2 border-dashed border-pl-border-strong rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pl-primary transition-colors bg-pl-sunken"
                onClick={() => faviconInput.current?.click()}
              >
                {settings.favicon_url ? (
                  <img src={settings.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" />
                ) : (
                  <div className="text-center text-pl-muted">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-xs">Upload Favicon</span>
                  </div>
                )}
              </div>
              <input type="file" ref={faviconInput} hidden accept="image/x-icon,image/png" onChange={(e) => handleUpload(e, 'favicon')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input 
              value={settings.company_name || ''} 
              onChange={(e) => onChange('company_name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tagline</Label>
            <Input 
              value={settings.company_tagline || ''} 
              onChange={(e) => onChange('company_tagline', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Website URL</Label>
            <Input 
              value={settings.website_url || ''} 
              onChange={(e) => onChange('website_url', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}