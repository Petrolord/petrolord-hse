import React from 'react';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandingTheme from '@/components/admin/BrandingTheme';
import DepartmentsTab from '@/components/admin/settings/DepartmentsTab';
import ComplianceTab from '@/components/admin/settings/ComplianceTab';
import MyProfileTab from '@/components/admin/settings/MyProfileTab';
import { Palette, Building2, ShieldCheck, User } from 'lucide-react';

export default function OrgAdminSettings() {
  const { currentOrganization } = useHSE();

  if (!currentOrganization) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 text-pl-text">
      <div className="mb-6">
        <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Organization Settings</h1>
        <p className="text-pl-muted">Manage your organization's branding, users, and compliance rules.</p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-6 h-auto p-1 grid grid-cols-2 md:inline-flex md:w-auto">
          <TabsTrigger value="branding" className="py-2.5 px-4 flex gap-2">
            <Palette className="w-4 h-4" /> <span className="hidden md:inline">Branding & Theme</span><span className="md:hidden">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="py-2.5 px-4 flex gap-2">
            <Building2 className="w-4 h-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="compliance" className="py-2.5 px-4 flex gap-2">
            <ShieldCheck className="w-4 h-4" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="profile" className="py-2.5 px-4 flex gap-2">
            <User className="w-4 h-4" /> <span className="hidden md:inline">My Profile</span><span className="md:hidden">Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="animate-in fade-in-50 focus-visible:outline-none">
          <BrandingTheme />
        </TabsContent>

        <TabsContent value="departments" className="animate-in fade-in-50 focus-visible:outline-none">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="compliance" className="animate-in fade-in-50 focus-visible:outline-none">
          <ComplianceTab />
        </TabsContent>

        <TabsContent value="profile" className="animate-in fade-in-50 focus-visible:outline-none">
          <MyProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}