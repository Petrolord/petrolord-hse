import React from 'react';
import { useHSE } from '@/context/HSEContext';
import { AlertCircle } from 'lucide-react';

import SuperAdminSettings from './roles/SuperAdminSettings';
import OrgAdminSettingsPage from './roles/OrgAdminSettings';
import CoordinatorSettings from './roles/CoordinatorSettings';
import OfficerSettings from './roles/OfficerSettings';
import ManagerSettings from './roles/ManagerSettings';
import EmployeeSettings from './roles/EmployeeSettings';
import AuditorSettings from './roles/AuditorSettings';
import ViewerSettings from './roles/ViewerSettings';

export default function SettingsRouter() {
  const { role } = useHSE();

  // Normalize role string (handle cases where it might differ slightly)
  const normalizedRole = role ? role.toLowerCase() : 'employee';

  if (normalizedRole === 'super_admin') return <SuperAdminSettings />;
  if (normalizedRole === 'org_admin') return <OrgAdminSettingsPage />;
  if (normalizedRole === 'hse_coordinator') return <CoordinatorSettings />;
  if (normalizedRole === 'hse_officer') return <OfficerSettings />;
  if (normalizedRole === 'manager' || normalizedRole === 'department_manager') return <ManagerSettings />;
  if (normalizedRole === 'auditor') return <AuditorSettings />;
  if (normalizedRole === 'viewer') return <ViewerSettings />;
  
  // Default fallback for 'employee', 'intern', 'contractor', 'staff_admin', 'supervisor' etc.
  return <EmployeeSettings />;
}