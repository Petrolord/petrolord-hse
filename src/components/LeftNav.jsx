import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart2, 
  Settings, 
  LogOut, 
  Users, 
  FileText, 
  CheckSquare, 
  HardHat, 
  Lightbulb, 
  AlertTriangle, 
  GraduationCap, 
  Activity, 
  Lock, 
  Leaf, 
  ClipboardList, 
  X, 
  Trophy, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin,
  Building2,
  Gauge,
  Ear
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHSE } from '@/context/HSEContext';
import { useAppState } from '@/context/AppStateContext';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Inside the design-system scope the rail is the fixed dark ink frame
// (InkRail in the layout gives it data-pl-theme="dark"), as the Suite's
// dashboard rail: gold section labels, a raised active item with a gold
// edge.
export default function LeftNav({ onClose }) {
  const { role, activeModule, setActiveModule } = useHSE();
  const { sidebarCollapsed, toggleSidebar, setPersistedModule } = useAppState();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleNavClick = (item) => {
    setActiveModule(item);
    setPersistedModule(item); // Persist for page refresh
    if (onClose) onClose();
  };

  const navItems = [
    { 
      category: "Main",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart2, roles: ['super_admin', 'org_admin', 'manager'] },
        { id: 'safety-statistics', label: 'Safety Statistics', icon: Gauge, roles: ['super_admin', 'org_admin', 'manager', 'supervisor'] },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
      ]
    },
    // PETROLORD ORG SETUP NAV v1 (2026-05-09)
    {
      category: "Organization Setup",
      items: [
        { id: 'admin-setup-hub', label: 'Setup Hub', icon: Home, roles: ['super_admin', 'org_admin'] },
        { id: 'admin-sites', label: 'Sites', icon: MapPin, roles: ['super_admin', 'org_admin'] },
        { id: 'admin-departments', label: 'Departments', icon: Building2, roles: ['super_admin', 'org_admin'] },
        { id: 'team', label: 'Members', icon: Users, roles: ['super_admin', 'org_admin', 'manager'] },
      ]
    },
    {
      category: "Reporting",
      items: [
        { id: 'my-reports', label: 'My Reports', icon: FileText, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
        { id: 'supervisor-dashboard', label: 'Supervisor View', icon: Users, roles: ['super_admin', 'org_admin', 'supervisor'] },
        { id: 'actions', label: 'Action Tracker', icon: CheckSquare, roles: ['super_admin', 'org_admin', 'manager', 'supervisor'] },
      ]
    },
    {
      category: "Operations",
      items: [
        { id: 'permits', label: 'Work Permits', icon: FileText, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'contractor'] },
        { id: 'contractor', label: 'Contractor Safety', icon: HardHat, roles: ['super_admin', 'org_admin', 'manager'] },
        { id: 'audit', label: 'Safety Audits', icon: ClipboardList, roles: ['super_admin', 'org_admin', 'manager', 'auditor'] },
        { id: 'training', label: 'Training', icon: GraduationCap, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
      ]
    },
    {
      category: "HSSE Pillars",
      items: [
        { id: 'health', label: 'Health', icon: Activity, roles: ['super_admin', 'org_admin', 'manager', 'health_officer'] },
        { id: 'occupational-hygiene', label: 'Occupational Hygiene', icon: Ear, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'health_officer'] },
        { id: 'security', label: 'Security', icon: Lock, roles: ['super_admin', 'org_admin', 'manager', 'security_officer'] },
        { id: 'environment', label: 'Environment', icon: Leaf, roles: ['super_admin', 'org_admin', 'manager', 'env_officer'] },
        { id: 'risk', label: 'Risk Mgmt', icon: AlertTriangle, roles: ['super_admin', 'org_admin', 'manager', 'risk_officer'] },
      ]
    },
    {
      category: "Knowledge",
      items: [
        { id: 'safety-moments-bank', label: 'Safety Moments', icon: Lightbulb, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
      ]
    },
    {
      category: "System",
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'org_admin'] },
        { id: 'help', label: 'Help Center', icon: HelpCircle, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] }
      ]
    }
  ];

  return (
    <div className={cn(
      "h-full bg-pl-surface border-r border-pl-border flex flex-col transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-[70px]" : "w-[280px]"
    )}>
      {/* Header / Collapse Toggle */}
      <div className={cn(
        "p-4 flex items-center justify-between border-b border-pl-border h-[64px]",
        sidebarCollapsed && "justify-center"
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 font-bold text-pl-text tracking-wider">
            <span className="text-pl-accent-text">PETROLORD</span> HSE
          </div>
        )}
        
        {/* Mobile close button */}
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop collapse button */}
        <div className="hidden lg:block">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4 px-2">
        <div className="space-y-6">
          {navItems.map((group, groupIndex) => {
            const visibleItems = group.items.filter(item => 
              !item.roles || item.roles.includes(role || 'staff') || role === 'super_admin'
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIndex}>
                {/* Category Label */}
                {!sidebarCollapsed && (
                  <h3 className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-pl-accent-text">
                    {group.category}
                  </h3>
                )}
                {sidebarCollapsed && (
                   <div className="h-[1px] bg-pl-border mx-2 mb-2" />
                )}

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = activeModule?.id === item.id;
                    const buttonContent = (
                      <button
                        onClick={() => handleNavClick(item)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          "w-full flex items-center rounded-lg transition-all duration-200 group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus",
                          sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-4 py-2.5",
                          isActive 
                            ? "bg-pl-raised text-pl-text shadow-[inset_3px_0_0_rgb(var(--pl-accent))]"
                            : "text-pl-muted hover:bg-pl-raised/60 hover:text-pl-text"
                        )}
                      >
                        <div className={cn("flex items-center relative z-10", !sidebarCollapsed && "gap-3")}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors flex-shrink-0",
                            isActive ? "text-pl-accent-text" : "text-pl-muted group-hover:text-pl-text"
                          )} />
                          {!sidebarCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">
                              {item.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );

                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.id} delayDuration={0}>
                          <TooltipTrigger asChild>
                            {buttonContent}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.id}>{buttonContent}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* pb-12 lifts Sign Out clear of the root Online pill (fixed bottom-left) */}
      <div className="px-4 pt-4 pb-12 border-t border-pl-border">
        {sidebarCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-full justify-center text-pl-text hover:text-pl-danger-text hover:bg-pl-danger-bg"
                onClick={handleLogout}
                aria-label="Sign Out"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-pl-text hover:text-pl-danger-text hover:bg-pl-danger-bg"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}