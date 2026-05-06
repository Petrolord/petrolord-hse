import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function EmployeeSettings() {
  return (
    <SettingsLayout 
      title="My Settings" 
      description="Manage your personal profile and safety preferences."
      icon={UserCheck}
    >
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Profile & Alerts</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Training Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>

        <TabsContent value="training">
          <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center text-[#7a7a9a]">
             <p>Training Certification Uploads & Preferences</p>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}