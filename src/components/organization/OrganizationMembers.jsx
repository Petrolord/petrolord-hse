import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Plus, Trash2, Shield, User } from 'lucide-react';
import { accountNativeSelect } from '@/components/account/accountChrome';
import { fetchOrganizationMembers, inviteMember, removeMember } from '@/services/organizationService';

export const OrganizationMembers = ({ organization, onUpdate }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    if(organization?.id) {
      loadMembers();
    }
  }, [organization?.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await fetchOrganizationMembers(organization.id);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!organization?.id) return;
    try {
      await inviteMember(organization.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInvite(false);
      alert(`Invite sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invite');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    try {
      await removeMember(memberToDelete, organization?.id);
      loadMembers();
      onUpdate && onUpdate();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const openDeleteDialog = (memberId) => {
    setMemberToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-pl-danger text-pl-danger-fg hover:bg-pl-danger/90"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription className="mt-1.5">Manage your organization members</CardDescription>
          </div>
          <Button 
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          {showInvite && (
            <form onSubmit={handleInvite} className="mb-6 p-4 rounded-lg border border-pl-border bg-pl-sunken space-y-4 text-pl-text">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={accountNativeSelect}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="org_admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Send Invite
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowInvite(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-pl-muted">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-pl-border-strong mx-auto mb-4" aria-hidden="true" />
              <p className="text-pl-muted">No members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-pl-border bg-pl-sunken text-pl-text">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-pl-surface border border-pl-border flex items-center justify-center">
                      <User className="w-5 h-5 text-pl-muted" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium break-all">{member.email}</p>
                      <p className="text-sm text-pl-muted">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">
                      {member.role === 'org_admin' || member.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                      {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ') : 'Member'}
                    </Badge>
                    {(member.role !== 'owner' && member.role !== 'org_admin') && (
                      <Button
                        onClick={() => openDeleteDialog(member.id)}
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${member.email}`}
                        title="Remove"
                        className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationMembers;
