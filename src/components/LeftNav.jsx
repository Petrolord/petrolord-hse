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
  PanelLeftOpen
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
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['super_admin', 'org_admin', 'manager', 'supervisor', 'staff'] },
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
        { id: 'team', label: 'Team Mgmt', icon: Users, roles: ['super_admin', 'org_admin', 'manager'] },
      ]
    },
    {
      category: "HSSE Pillars",
      items: [
        { id: 'health', label: 'Health', icon: Activity, roles: ['super_admin', 'org_admin', 'manager', 'health_officer'] },
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
      "h-full bg-[#1e1e2d] border-r border-[#2d2d4a] flex flex-col transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-[70px]" : "w-[280px]"
    )}>
      {/* Header / Collapse Toggle */}
      <div className={cn(
        "p-4 flex items-center justify-between border-b border-[#2d2d4a] h-[64px]",
        sidebarCollapsed && "justify-center"
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 font-bold text-white tracking-wider">
            <span className="text-[#FFC107]">PETROLORD</span> HSE
          </div>
        )}
        
        {/* Mobile close button */}
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop collapse button */}
        <div className="hidden lg:block">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-gray-400 hover:text-white hover:bg-[#2d2d4a]"
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
                  <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 animate-in fade-in duration-300">
                    {group.category}
                  </h3>
                )}
                {sidebarCollapsed && (
                   <div className="h-[1px] bg-[#2d2d4a] mx-2 mb-2" />
                )}

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = activeModule?.id === item.id;
                    const buttonContent = (
                      <button
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "w-full flex items-center rounded-lg transition-all duration-200 group relative overflow-hidden",
                          sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-4 py-2.5",
                          isActive 
                            ? "bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/20" 
                            : "text-gray-400 hover:bg-[#2d2d4a] hover:text-white"
                        )}
                      >
                        <div className={cn("flex items-center relative z-10", !sidebarCollapsed && "gap-3")}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors flex-shrink-0",
                            isActive ? "text-black" : "text-gray-500 group-hover:text-white"
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
                          <TooltipContent side="right" className="bg-[#2d2d4a] text-white border-[#3d3d5c]">
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

      <div className="p-4 border-t border-[#2d2d4a]">
        {sidebarCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-red-900 text-white border-red-800">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 animate-in fade-in duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}