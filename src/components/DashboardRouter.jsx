import React from 'react';
import { useHSE } from '@/context/HSEContext';
import { Navigate } from 'react-router-dom';

// Dashboard Views
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import OrgAdminDashboard from '@/components/dashboards/OrgAdminDashboard';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import SupervisorDashboard from '@/components/dashboards/SupervisorDashboard';
import StaffDashboard from '@/components/dashboards/StaffDashboard';
import HSEDashboard from '@/components/hse/HSEDashboard'; // Import the main operational dashboard
import DashboardView from '@/components/views/DashboardView'; // Fallback generic view

export default function DashboardRouter() {
  const { role, activeModule } = useHSE();

  // If user specifically requested 'dashboard' module, route by role
  console.log("🚦 [ROUTER] Routing dashboard for role:", role);

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'org_admin':
    case 'owner':
      // FIX: Route Org Admins to the main AI Insights/Operational Dashboard (HSEDashboard)
      // instead of the administration settings page (OrgAdminDashboard).
      return <HSEDashboard />; 
    case 'manager':
      return <ManagerDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'staff':
    case 'employee':
      return <StaffDashboard />;
    default:
      // Fallback for unknown roles or generic view
      return <DashboardView />;
  }
}