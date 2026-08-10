import React from 'react';
import { useHSE } from '@/context/HSEContext';
import HSEDashboard from './hse/HSEDashboard'; // UPDATED to use the main dashboard with heatmap
import AnalyticsDashboardModule from './hse/analytics/AnalyticsDashboardModule';
import LeaderboardModule from './hse/LeaderboardModule';
import MyReportsModule from './hse/MyReportsModule';
import SupervisorDashboardModule from './hse/SupervisorDashboardModule';
import ActionTrackingModule from './hse/ActionTrackingModule';
import WorkPermitsModule from './hse/WorkPermitsModule';
import ContractorSafetyModule from './hse/contractor/ContractorSafetyModule';
import SafetyAuditModule from './hse/audit/SafetyAuditModule';
import TrainingCompetencyModule from './hse/training/TrainingCompetencyModule';
import TeamManagementModule from './hse/team/TeamManagementModule';
import SecurityModule from './hse/security/SecurityModule';
import EnvironmentModule from './petrolord/EnvironmentModule';
import RiskManagementModule from './petrolord/RiskManagementModule';
import SafetyMomentsBankModule from './hse/safety-moments/SafetyMomentsBankModule';
import OrgAdminSettings from './admin/OrgAdminSettings';
// PETROLORD ORG SETUP MAINCONTENT v1 (2026-05-09)
// PETROLORD ORG SETUP MAINCONTENT v2 (2026-05-09): wire Sites + Departments admin
import OrgSetupHub from './hse/admin/OrgSetupHub';
import SitesAdmin from './hse/admin/SitesAdmin';
import DepartmentsAdmin from './hse/admin/DepartmentsAdmin';
import HealthModule from './petrolord/health/HealthModule';
import HelpCenter from './help/HelpCenter';
import PredictiveInsightsDashboard from './analytics/PredictiveInsightsDashboard';

export default function MainContent() {
  const { activeModule } = useHSE();

  // If no active module, default to Dashboard
  const currentModuleId = activeModule?.id || 'dashboard';

  const renderModule = () => {
    switch (currentModuleId) {
      case 'dashboard': return <HSEDashboard />;
      case 'analytics': return <AnalyticsDashboardModule />;
      case 'ai-analytics': return <PredictiveInsightsDashboard />;
      case 'leaderboard': return <LeaderboardModule />;
      
      // Reporting
      case 'my-reports': return <MyReportsModule />;
      case 'supervisor-dashboard': return <SupervisorDashboardModule />;
      case 'actions': return <ActionTrackingModule />;
      
      // Operations
      case 'permits': return <WorkPermitsModule />;
      case 'contractor': return <ContractorSafetyModule />;
      case 'audit': return <SafetyAuditModule />;
      case 'training': return <TrainingCompetencyModule />;
      case 'team': return <TeamManagementModule />;
      case 'admin-setup-hub': return <OrgSetupHub />;
      case 'admin-sites': return <SitesAdmin />;
      case 'admin-departments': return <DepartmentsAdmin />;
      
      // HSSE Pillars - Consolidated
      case 'health': return <HealthModule />; 
      case 'security': return <SecurityModule />;
      case 'environment': return <EnvironmentModule />; 
      case 'risk': return <RiskManagementModule />;
      
      // Knowledge
      case 'safety-moments-bank': return <SafetyMomentsBankModule />;
      
      // System
      case 'settings': return <OrgAdminSettings />;
      
      // Help
      case 'help': return <HelpCenter />;
      
      default: return <HSEDashboard />;
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[var(--bg-app)]">
      {renderModule()}
    </div>
  );
}