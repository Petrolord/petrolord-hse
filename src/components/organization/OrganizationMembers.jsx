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
      await removeMember(memberToDelete);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'org_admin':
      case 'admin':
      case 'super_admin':
        return 'bg-red-900 text-red-100 hover:bg-red-800';
      case 'manager':
        return 'bg-blue-900 text-blue-100 hover:bg-blue-800';
      default:
        return 'bg-gray-700 text-gray-100 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Member</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove this member from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Team Members</CardTitle>
            <CardDescription className="text-gray-400">Manage your organization members</CardDescription>
          </div>
          <Button 
            onClick={() => setShowInvite(!showInvite)}
            className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2 text-white"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          {showInvite && (
            <form onSubmit={handleInvite} className="mb-6 p-4 bg-gray-700 rounded-lg space-y-4 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="bg-gray-600 border-gray-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="org_admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Send Invite
                </Button>
                <Button 
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <p className="text-sm text-gray-400">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role === 'org_admin' || member.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                      {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ') : 'Member'}
                    </Badge>
                    {(member.role !== 'owner' && member.role !== 'org_admin') && (
                      <Button
                        onClick={() => openDeleteDialog(member.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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