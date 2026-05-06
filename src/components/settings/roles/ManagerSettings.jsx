import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function ManagerSettings() {
  return (
    <SettingsLayout 
      title="Manager Settings" 
      description="Departmental configuration and approval workflows."
      icon={Briefcase}
    >
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Profile & Alerts</TabsTrigger>
          <TabsTrigger value="dept" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Department Info</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>

        <TabsContent value="dept">
          <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center text-[#7a7a9a]">
             <p>Department KPI & Budget Settings</p>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}