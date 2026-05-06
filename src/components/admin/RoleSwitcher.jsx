import React from 'react';
import { useHSE } from '@/context/HSEContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCog } from 'lucide-react';

export default function RoleSwitcher() {
  const { realRole, simulatedRole, setSimulatedRole } = useHSE();

  // Only allow Super Admins to see this component
  if (realRole !== 'super_admin') return null;

  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'org_admin', label: 'Org Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'hse_coordinator', label: 'HSE Coordinator' },
    { value: 'hse_officer', label: 'HSE Officer' },
    { value: 'department_manager', label: 'Department Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'staff_admin', label: 'Staff Admin' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'employee', label: 'Employee' },
    { value: 'intern', label: 'Intern' },
    { value: 'viewer', label: 'Viewer' },
  ];

  return (
    <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg shadow-sm">
      <UserCog className="h-4 w-4 text-[var(--text-secondary)]" />
      <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">View as:</span>
      <Select 
        value={simulatedRole || 'super_admin'} 
        onValueChange={(val) => setSimulatedRole(val === 'super_admin' ? null : val)}
      >
        <SelectTrigger className="h-7 w-[160px] text-xs border-none bg-transparent focus:ring-0 focus:ring-offset-0 px-1 text-[var(--text-primary)]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]">
          {roles.map(role => (
            <SelectItem key={role.value} value={role.value} className="text-xs cursor-pointer focus:bg-[var(--bg-hover)] focus:text-[var(--text-primary)]">
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {simulatedRole && (
        <Badge variant="outline" className="text-[10px] h-5 border-yellow-500 text-yellow-500">
          Simulating
        </Badge>
      )}
    </div>
  );
}