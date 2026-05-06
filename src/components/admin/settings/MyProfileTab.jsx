import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useHSE } from '@/context/HSEContext';
import { orgSettingsService } from '@/services/orgSettingsService';
import { User, Mail, Phone, Lock, Upload, Shield, Activity, Loader2 } from 'lucide-react';

export default function MyProfileTab() {
  const { currentUser, currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [logs, setLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Edit State
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [deptId, setDeptId] = useState('');
  const [notifPrefs, setNotifPrefs] = useState({ email: true, in_app: true, sms: false });

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profData, logsData, depts] = await Promise.all([
        orgSettingsService.getUserProfile(currentUser.id),
        orgSettingsService.getActivityLogs(currentUser.id),
        orgSettingsService.getDepartments(currentOrganization?.id)
      ]);
      
      if (profData) {
        setProfile(profData);
        setFullName(profData.full_name || currentUser.name || '');
        setJobTitle(profData.job_title || '');
        setPhone(profData.phone_number || '');
        setDeptId(profData.department_id || '');
        setNotifPrefs(profData.notification_prefs || { email: true, in_app: true, sms: false });
      } else {
        // Initialize from auth context if no profile record yet
        setFullName(currentUser.name || '');
      }
      setLogs(logsData || []);
      setDepartments(depts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        id: currentUser.id,
        org_id: currentOrganization?.id,
        full_name: fullName,
        job_title: jobTitle,
        phone_number: phone,
        department_id: deptId || null,
        notification_prefs: notifPrefs,
        updated_at: new Date()
      };
      
      await orgSettingsService.upsertUserProfile(payload);
      await orgSettingsService.logActivity(currentUser.id, 'Updated Profile', { fields: ['info'] });
      
      toast({ title: 'Success', description: 'Profile updated successfully' });
      loadProfile();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      return toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
    }
    if (newPassword.length < 6) {
      return toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
    }

    setUpdatingPass(true);
    try {
      await orgSettingsService.updateUserPassword(newPassword);
      await orgSettingsService.logActivity(currentUser.id, 'Changed Password');
      toast({ title: 'Success', description: 'Password changed successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast({ title: 'Uploading...', description: 'Please wait while we upload your image.' });
      const url = await orgSettingsService.uploadAvatar(currentUser.id, file);
      await orgSettingsService.upsertUserProfile({ id: currentUser.id, avatar_url: url });
      setProfile(prev => ({ ...prev, avatar_url: url }));
      toast({ title: 'Success', description: 'Profile picture updated' });
    } catch (e) {
      toast({ title: 'Error', description: 'Image upload failed: ' + e.message, variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Basic Info & Avatar */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-[var(--accent)]"/> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group h-24 w-24 rounded-full overflow-hidden bg-[var(--bg-app)] border-2 border-[var(--border-color)] flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 opacity-50" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] text-white">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">{fullName || 'User'}</h3>
                <p className="text-[var(--text-secondary)]">{currentUser?.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] capitalize">{currentUser?.role?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Safety Officer" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={currentUser?.email} disabled className="opacity-70 bg-[var(--bg-app)]" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Department</Label>
                <Select value={deptId || "none"} onValueChange={v => setDeptId(v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} className="petrolord-button">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-70" />
                <span>Email Notifications</span>
              </div>
              <Switch checked={notifPrefs.email} onCheckedChange={c => setNotifPrefs(prev => ({...prev, email: c}))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 opacity-70" />
                <span>In-App Alerts</span>
              </div>
              <Switch checked={notifPrefs.in_app} onCheckedChange={c => setNotifPrefs(prev => ({...prev, in_app: c}))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 opacity-70" />
                <span>SMS Alerts (Critical Only)</span>
              </div>
              <Switch checked={notifPrefs.sms} onCheckedChange={c => setNotifPrefs(prev => ({...prev, sms: c}))} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Security & Activity */}
      <div className="space-y-6">
        <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-4 w-4"/> Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
              <h4 className="text-sm font-semibold">Change Password</h4>
              <Input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
              <Input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handlePasswordUpdate}
                disabled={!newPassword || updatingPass}
              >
                {updatingPass ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Update Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <span className="text-sm">Two-Factor Auth</span>
              <Switch checked={profile.two_factor_enabled || false} onCheckedChange={() => toast({ title: 'Not Available', description: '2FA setup requires external provider integration.', variant: 'destructive' })} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-4 w-4"/> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="flex gap-3 text-sm border-b border-[var(--border-color)] pb-2 last:border-0">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[var(--text-muted)]">No recent activity recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}