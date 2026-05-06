import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from 'lucide-react';

export default function ViewerSettings() {
  return (
    <SettingsLayout 
      title="Viewer Settings" 
      description="Manage your viewing preferences and notifications."
      icon={Eye}
    >
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Profile & Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}