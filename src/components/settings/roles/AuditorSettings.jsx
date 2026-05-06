import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function AuditorSettings() {
  return (
    <SettingsLayout 
      title="Auditor Configuration" 
      description="Audit scopes, standards, and reporting preferences."
      icon={FileSearch}
    >
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Profile & Alerts</TabsTrigger>
          <TabsTrigger value="standards" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Audit Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>

        <TabsContent value="standards">
          <Card className="bg-[#252541] border-[#3a3a5a] p-8 text-center text-[#7a7a9a]">
             <p>ISO/Regulatory Standard Selection</p>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}