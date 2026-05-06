import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, LayoutTemplate, Type } from 'lucide-react';

export default function LoginPageCustomizer({ settings, setSettings, onUpload }) {
  const bgInputRef = useRef(null);

  const updateLoginConfig = (key, value) => {
    setSettings(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        login: {
          ...prev.branding_config?.login,
          [key]: value
        }
      }
    }));
  };

  const loginConfig = settings.branding_config?.login || {};

  return (
    <div className="space-y-6">
      <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutTemplate className="h-5 w-5 text-[var(--accent)]"/> Layout & Background</CardTitle>
          <CardDescription>Customize the entrance experience for your users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Label>Login Form Position</Label>
            <Select value={loginConfig.position || 'center'} onValueChange={(v) => updateLoginConfig('position', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="left">Split Left</SelectItem>
                <SelectItem value="right">Split Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Background Image</Label>
            <div className="flex gap-4 items-start">
              <div 
                className="w-32 h-20 bg-gray-800 rounded border border-dashed border-gray-600 flex items-center justify-center cursor-pointer overflow-hidden relative"
                onClick={() => bgInputRef.current?.click()}
              >
                {loginConfig.bgImage ? (
                  <img src={loginConfig.bgImage} alt="Login Bg" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-500" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Button variant="outline" size="sm" onClick={() => bgInputRef.current?.click()}>Upload Image</Button>
                {loginConfig.bgImage && (
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => updateLoginConfig('bgImage', null)}>Remove</Button>
                )}
                <p className="text-xs text-[var(--text-muted)]">Recommended 1920x1080px. Max 2MB.</p>
              </div>
              <input 
                type="file" 
                ref={bgInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => onUpload(e, 'loginBg')} // You'll need to handle 'loginBg' type in parent
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Background Color Overlay</Label>
            <div className="flex gap-3">
              <Input 
                type="color" 
                value={loginConfig.bgColor || '#111827'}
                onChange={(e) => updateLoginConfig('bgColor', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={loginConfig.bgColor || '#111827'}
                onChange={(e) => updateLoginConfig('bgColor', e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-[var(--accent)]"/> Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Company Logo</Label>
              <p className="text-xs text-[var(--text-muted)]">Display logo above login form</p>
            </div>
            <Switch 
              checked={loginConfig.showLogo !== false}
              onCheckedChange={(v) => updateLoginConfig('showLogo', v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Input 
              placeholder="Sign in to your account" 
              value={loginConfig.welcomeText || ''}
              onChange={(e) => updateLoginConfig('welcomeText', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Tagline</Label>
            <Input 
              placeholder="e.g. Authorized Personnel Only" 
              value={loginConfig.tagline || ''}
              onChange={(e) => updateLoginConfig('tagline', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}