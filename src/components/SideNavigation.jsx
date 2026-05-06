import React from 'react';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Eye, 
  FileText, 
  Briefcase,
  HardHat,
  Lightbulb,
  Database,
  Settings
} from 'lucide-react';

function SideNavigation({ activeModule, setActiveModule }) {
  const { role, isSuperAdmin, isOrgAdmin, isManager } = useHSEAccess();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      allowed: true 
    },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      icon: ShieldAlert, 
      allowed: true 
    },
    { 
      id: 'observations', 
      label: 'Observations', 
      icon: Eye, 
      allowed: true 
    },
    { 
      id: 'permits', 
      label: 'Permits (PTW)', 
      icon: FileText, 
      allowed: isManager || role === 'supervisor' || role === 'contractor'
    },
    { 
      id: 'inspections', 
      label: 'Inspections', 
      icon: HardHat, 
      allowed: isManager || role === 'supervisor'
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: Users,
      allowed: isManager || isOrgAdmin
    },
    {
      id: 'safety-moments-bank',
      label: 'Safety Moments',
      icon: Lightbulb,
      allowed: true 
    },
    { 
      id: 'users', 
      label: 'User Mgmt', 
      icon: Users, 
      allowed: isOrgAdmin 
    },
    { 
      id: 'admin_settings', 
      label: 'Org Settings', 
      icon: Briefcase, 
      allowed: isOrgAdmin 
    },
    { 
      id: 'system_config', 
      label: 'System Config', 
      icon: Database, 
      allowed: isSuperAdmin 
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowed: true
    }
  ];

  return (
    <nav className="space-y-1 p-2">
      {menuItems.filter(item => item.allowed).map((item) => {
        const isActive = activeModule?.id === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveModule && setActiveModule(item)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
              ${isActive 
                ? 'bg-[#FFC107] text-[#1a1a2e] shadow-lg shadow-[#FFC107]/20' 
                : 'text-[#b0b0c0] hover:bg-[#252541] hover:text-[#e0e0e0]'
              }`}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'text-[#1a1a2e]' : 'text-[#7a7a9a]'}`} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default SideNavigation;