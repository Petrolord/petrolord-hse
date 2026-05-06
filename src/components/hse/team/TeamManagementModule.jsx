import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import InviteTeamMember from './InviteTeamMember';
import OrganizationMembers from '@/components/organization/OrganizationMembers';
import { Users } from 'lucide-react';

export default function TeamManagementModule() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            Team Management
          </h2>
          <p className="text-gray-400 mt-1">Manage members, roles, and invitations.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <InviteTeamMember />
        
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizationMembers />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}