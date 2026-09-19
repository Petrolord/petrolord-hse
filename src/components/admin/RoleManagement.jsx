import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Check } from 'lucide-react';
import { adminService } from '@/services/adminService';

// Shows the permission state actually stored in public.permissions and
// public.role_permissions. It used to draw a made-up matrix with random
// checkmarks (Math.random() > 0.5), which looked like real access control.
// Nothing here grants access: the app's navigation and RLS decide that.
export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [granted, setGranted] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, p] = await Promise.all([adminService.getRoles(), adminService.getPermissions()]);
        setRoles(r || []);
        setPermissions(p || []);
        if (r && r.length) setSelectedRoleId(r[0].id);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Could not load roles and permissions.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    adminService.getRolePermissionIds(selectedRoleId)
      .then((ids) => setGranted(new Set(ids)))
      .catch((e) => setError(e.message || 'Could not load this role\'s permissions.'));
  }, [selectedRoleId]);

  const resources = [...new Set(permissions.map((p) => p.resource))].sort();
  const actions = [...new Set(permissions.map((p) => p.action))].sort();
  const find = (resource, action) => permissions.find((p) => p.resource === resource && p.action === action);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
        <div className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a]">
            <h3 className="text-lg font-medium text-white">Role Hierarchy & Permissions</h3>
            <p className="text-sm text-[#b0b0c0]">The permissions stored for each role. Read only.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-4">
                {roles.map(role => (
                    <Card
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`bg-[#252541] cursor-pointer transition-colors ${role.id === selectedRoleId ? 'border-[#FFC107]' : 'border-[#3a3a5a] hover:border-[#FFC107]'}`}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                                {role.name}
                                <Shield className="h-4 w-4 text-[#FFC107]" />
                            </CardTitle>
                            <CardDescription className="text-xs text-[#7a7a9a]">{role.description || 'System Role'}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card className="md:col-span-3 bg-[#1a1a2e] border-[#3a3a5a]">
                <CardHeader>
                    <CardTitle className="text-white">Permission Matrix</CardTitle>
                    <CardDescription>
                      {selectedRole ? `Permissions stored for ${selectedRole.name}.` : 'Select a role.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {permissions.length === 0 ? (
                      <p className="text-sm text-[#b0b0c0]">
                        No permissions are stored in the database yet, so there is nothing to show for any role.
                        Access in Petrolord HSE is currently decided by each member's role in the organization.
                      </p>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[#b0b0c0] border-b border-[#3a3a5a]">
                                <tr>
                                    <th className="py-3 px-4">Resource</th>
                                    {actions.map(action => (
                                        <th key={action} className="py-3 px-4 text-center capitalize">{action}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-[#e0e0e0]">
                                {resources.map(resource => (
                                    <tr key={resource} className="border-b border-[#3a3a5a]/30">
                                        <td className="py-3 px-4 font-medium">{resource}</td>
                                        {actions.map(action => {
                                          const perm = find(resource, action);
                                          const has = perm && granted.has(perm.id);
                                          return (
                                            <td key={action} className="py-3 px-4 text-center" title={perm ? (has ? 'Granted' : 'Not granted') : 'No such permission'}>
                                                <div className="flex justify-center">
                                                    {perm ? (
                                                      <div className="h-5 w-5 rounded border border-[#3a3a5a] bg-[#252541] flex items-center justify-center">
                                                          {has && <Check className="h-3 w-3 text-[#FFC107]" />}
                                                      </div>
                                                    ) : <span className="text-[#5a5a7a]">-</span>}
                                                </div>
                                            </td>
                                          );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
