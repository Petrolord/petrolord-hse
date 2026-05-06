import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Database, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function UserManagementAudit() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, admins: 0, hseOnly: 0, suiteUsers: 0 });

  useEffect(() => {
    loadUserAudit();
  }, []);

  const loadUserAudit = async () => {
    try {
      // Fetch organization users with their metadata
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          id,
          role,
          user_role,
          status,
          modules,
          apps,
          user_id,
          created_at,
          organizations (name)
        `)
        .limit(50); // Limit for performance in this view

      if (error) throw error;

      // Process for summary
      const stats = data.reduce((acc, user) => {
        acc.total++;
        if (user.role === 'owner' || user.role === 'admin') acc.admins++;
        
        const isHSE = user.modules?.some(m => m.includes('HSE'));
        const isSuite = user.modules?.some(m => !m.includes('HSE'));
        
        if (isHSE && !isSuite) acc.hseOnly++;
        if (isSuite) acc.suiteUsers++;
        
        return acc;
      }, { total: 0, admins: 0, hseOnly: 0, suiteUsers: 0 });

      setUsers(data || []);
      setSummary(stats);
    } catch (err) {
      console.error("Audit load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-white">Loading audit data...</div>;

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{summary.total}</div></CardContent>
        </Card>
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Admins</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-400">{summary.admins}</div></CardContent>
        </Card>
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">HSE Only</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{summary.hseOnly}</div></CardContent>
        </Card>
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Suite Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-400">{summary.suiteUsers}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-[#1f1f35] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" /> 
            Database Schema Alignment
          </CardTitle>
          <CardDescription>
            Live view of `organization_users` table showing cross-app role distribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#3a3a5a]">
                <TableHead className="text-gray-400">Organization</TableHead>
                <TableHead className="text-gray-400">Role (HSE Context)</TableHead>
                <TableHead className="text-gray-400">Modules (Access)</TableHead>
                <TableHead className="text-gray-400">Apps</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-[#3a3a5a]">
                  <TableCell className="font-medium">{user.organizations?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.modules?.map((m, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#2d2d4a] text-gray-300 border border-[#3a3a5a]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.apps?.map((a, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#2d2d4a] text-gray-300 border border-[#3a3a5a]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs ${user.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}