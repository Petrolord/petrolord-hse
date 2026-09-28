import React from 'react';
import InviteTeamMember from './InviteTeamMember';
import OrganizationMembers from '@/components/organization/OrganizationMembers';
import { Users } from 'lucide-react';

export default function TeamManagementModule() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text flex items-center gap-2">
            <Users className="h-6 w-6 text-pl-primary-text" aria-hidden="true" />
            Team Management
          </h2>
          <p className="text-pl-muted mt-1">Manage members, roles, and invitations.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <InviteTeamMember />
        
        {/* OrganizationMembers draws its own "Team Members" card; the
            outer "Active Members" card around it is gone, so the page no
            longer shows a card inside a card. */}
        <OrganizationMembers />
      </div>
    </div>
  );
}
