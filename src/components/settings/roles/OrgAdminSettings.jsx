import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import PersonalSettings from '@/components/settings/PersonalSettings';
import OrgAdminBranding from '@/components/admin/OrgAdminSettings'; 
// import DepartmentsTab from '@/components/admin/settings/DepartmentsTab'; // Removed/Hidden
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileCheck } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function OrgAdminSettingsPage() {
  return (
    <SettingsLayout 
      title="Organization Settings" 
      description="Manage your organization's branding, users, and compliance rules."
      icon={Building2}
    >
      <Tabs defaultValue="branding" className="w-full space-y-6">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="branding" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Branding & Theme</TabsTrigger>
          {/* Departments Tab Removed from UI */}
          <TabsTrigger value="compliance" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">Compliance</TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <OrgAdminBranding />
        </TabsContent>

        <TabsContent value="compliance">
           <Card className="bg-[#252541] border-[#3a3a5a] h-64 flex items-center justify-center">
             <div className="text-center text-[#7a7a9a]">
                <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Compliance Rules Engine</p>
                <p className="text-xs mt-1">Set mandatory training and safety thresholds.</p>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}