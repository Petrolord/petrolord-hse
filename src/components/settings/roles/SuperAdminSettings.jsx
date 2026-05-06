import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Database, Server, Activity, Download } from 'lucide-react';

export default function SuperAdminSettings() {
  return (
    <SettingsLayout 
      title="System Settings" 
      description="Configure global platform parameters and maintenance tasks."
      icon={ShieldAlert}
    >
      <Tabs defaultValue="system" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="system" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">System Health</TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Maintenance & Backup</TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2"><Activity className="h-5 w-5" /> Operational</CardTitle>
                <CardDescription>System Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">99.99%</div>
                <p className="text-sm text-[#7a7a9a]">Uptime (30 Days)</p>
              </CardContent>
            </Card>
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2"><Server className="h-5 w-5" /> Database</CardTitle>
                <CardDescription>Storage Usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">45 GB</div>
                <p className="text-sm text-[#7a7a9a]">of 500 GB Provisioned</p>
              </CardContent>
            </Card>
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader>
                <CardTitle className="text-[#FFC107] flex items-center gap-2"><Database className="h-5 w-5" /> API Calls</CardTitle>
                <CardDescription>Last 24 Hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">1.2M</div>
                <p className="text-sm text-[#7a7a9a]">Requests Processed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <CardTitle className="text-white">Database Backups</CardTitle>
              <CardDescription className="text-[#7a7a9a]">Manage system snapshots and restoration points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-lg border border-[#3a3a5a]">
                <div>
                  <p className="text-white font-medium">Daily Auto-Backup</p>
                  <p className="text-xs text-[#7a7a9a]">Last run: Today at 03:00 AM</p>
                </div>
                <Button variant="outline" className="border-[#3a3a5a] text-white"><Download className="mr-2 h-4 w-4" /> Download</Button>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="destructive">Initiate Emergency Restore</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}