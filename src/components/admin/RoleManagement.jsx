import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Check } from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  
  // Mock permissions matrix for UI demonstration since we didn't populate permission rows yet
  const permissionCategories = ['Organizations', 'Users', 'Reports', 'Settings'];
  const actions = ['Create', 'Read', 'Update', 'Delete'];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await adminService.getRoles();
      setRoles(data || []);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-[#252541] p-4 rounded-lg border border-[#3a3a5a]">
            <div>
                <h3 className="text-lg font-medium text-white">Role Hierarchy & Permissions</h3>
                <p className="text-sm text-[#b0b0c0]">Configure RBAC matrix for the platform.</p>
            </div>
            <Button className="petrolord-button"><Plus className="mr-2 h-4 w-4" /> Create Role</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-4">
                {roles.map(role => (
                    <Card key={role.id} className="bg-[#252541] border-[#3a3a5a] cursor-pointer hover:border-[#FFC107] transition-colors">
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
                    <CardDescription>Effective permissions for selected role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[#b0b0c0] border-b border-[#3a3a5a]">
                                <tr>
                                    <th className="py-3 px-4">Resource</th>
                                    {actions.map(action => (
                                        <th key={action} className="py-3 px-4 text-center">{action}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-[#e0e0e0]">
                                {permissionCategories.map(cat => (
                                    <tr key={cat} className="border-b border-[#3a3a5a]/30">
                                        <td className="py-3 px-4 font-medium">{cat}</td>
                                        {actions.map(action => (
                                            <td key={action} className="py-3 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <div className="h-5 w-5 rounded border border-[#3a3a5a] bg-[#252541] flex items-center justify-center cursor-pointer hover:border-[#FFC107]">
                                                        {Math.random() > 0.5 && <Check className="h-3 w-3 text-[#FFC107]" />}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}