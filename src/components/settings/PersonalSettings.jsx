import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useHSE } from '@/context/HSEContext';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Phone, Bell, Shield } from 'lucide-react';

export default function PersonalSettings() {
  const { currentUser } = useHSE();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.user_metadata?.first_name || '',
        lastName: currentUser.user_metadata?.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.user_metadata?.phone || '',
        emailNotifications: currentUser.user_metadata?.email_notifications ?? true,
        pushNotifications: currentUser.user_metadata?.push_notifications ?? true,
        smsNotifications: currentUser.user_metadata?.sms_notifications ?? false
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would update the user profile
      // For now, just show success message
      toast({
        title: "Settings Updated",
        description: "Your personal settings have been saved.",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-[#252541] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-[#7a7a9a]">
            Update your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#e0e0e0]">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-[#1a1a2e] border-[#3a3a5a] text-white"
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#e0e0e0]">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-[#1a1a2e] border-[#3a3a5a] text-white"
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#e0e0e0] flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-[#1a1a2e] border-[#3a3a5a] text-white"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#e0e0e0] flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-[#1a1a2e] border-[#3a3a5a] text-white"
              placeholder="Enter phone number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-[#252541] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-[#7a7a9a]">
            Choose how you'd like to receive safety alerts and updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[#e0e0e0] font-medium">Email Notifications</Label>
              <p className="text-sm text-[#7a7a9a]">Receive safety alerts and updates via email</p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[#e0e0e0] font-medium">Push Notifications</Label>
              <p className="text-sm text-[#7a7a9a]">Browser notifications for urgent safety alerts</p>
            </div>
            <Switch
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[#e0e0e0] font-medium">SMS Notifications</Label>
              <p className="text-sm text-[#7a7a9a]">Text messages for critical safety incidents</p>
            </div>
            <Switch
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-[#252541] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription className="text-[#7a7a9a]">
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#3a3a5a]">
              Change Password
            </Button>
            <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#3a3a5a]">
              Enable Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#FFC107] hover:bg-[#ffb300] text-[#1a1a2e] font-bold px-8"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}