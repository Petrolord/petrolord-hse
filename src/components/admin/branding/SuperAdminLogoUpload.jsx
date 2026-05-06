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
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">Branding Status</CardTitle>
            <Switch 
              checked={settings.is_branding_enabled}
              onCheckedChange={(v) => onChange('is_branding_enabled', v)}
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Visual Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Primary Logo</Label>
              <div 
                className="h-32 border-2 border-dashed border-[#3a3a5a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-[#111827]"
                onClick={() => logoInput.current?.click()}
              >
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
              <input type="file" ref={logoInput} hidden accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Favicon</Label>
              <div 
                className="h-32 border-2 border-dashed border-[#3a3a5a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-[#111827]"
                onClick={() => faviconInput.current?.click()}
              >
                {settings.favicon_url ? (
                  <img src={settings.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" />
                ) : (
                  <div className="text-center text-gray-500">
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

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-base">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-gray-400">Company Name</Label>
            <Input 
              value={settings.company_name || ''} 
              onChange={(e) => onChange('company_name', e.target.value)}
              className="bg-[#111827] border-[#3a3a5a] text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-400">Tagline</Label>
            <Input 
              value={settings.company_tagline || ''} 
              onChange={(e) => onChange('company_tagline', e.target.value)}
              className="bg-[#111827] border-[#3a3a5a] text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-400">Website URL</Label>
            <Input 
              value={settings.website_url || ''} 
              onChange={(e) => onChange('website_url', e.target.value)}
              className="bg-[#111827] border-[#3a3a5a] text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}