import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function CoordinatorSettings() {
  return (
    <SettingsLayout 
      title="HSE Coordinator Settings" 
      description="Manage reporting templates and team assignments."
      icon={ClipboardList}
    >
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Profile & Alerts</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Report Templates</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Team Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center text-[#7a7a9a]">
             <p>Template Builder Placeholder</p>
             <p className="text-xs">Create custom forms for observations and incidents.</p>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
           <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center text-[#7a7a9a]">
             <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
             <p>Safety Officer Zone Assignments</p>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}