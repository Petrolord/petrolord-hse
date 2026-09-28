import React, { useState } from 'react';
import { Search, Menu, LogOut, User, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useHSE } from '@/context/HSEContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppSwitcher from '@/components/layout/AppSwitcher';
import PetroLordLogo from '@/components/layout/PetroLordLogo';
import QuickReport from '@/components/hse/QuickReport';
import { gamificationService } from '@/services/gamificationService';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useThemeClass } from '@/design/themeClass';

// The signed-in header. Outside a design-system scope it renders exactly as
// before; inside one it takes the theme roles and shows the ThemeToggle
// (which renders nothing outside a scope).

const TopBar = ({ toggleMobileMenu, onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const { currentUser, currentOrganization } = useHSE();
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const tc = useThemeClass();

  // Poll for points updates
  React.useEffect(() => {
    const fetchPoints = async () => {
      if (currentUser && currentOrganization) {
        const stats = await gamificationService.getUserScore(currentUser.id, currentOrganization.id);
        setPoints(stats.total_points);
        setStreak(stats.current_streak);
      }
    };
    fetchPoints();
    const interval = setInterval(fetchPoints, 30000);
    return () => clearInterval(interval);
  }, [currentUser, currentOrganization]);

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleMenuToggle = () => {
    if (toggleMobileMenu) toggleMobileMenu();
    if (onToggleSidebar) onToggleSidebar();
  };

  return (
    <header className={tc('h-16 bg-[#1f1f35] border-b border-[#2f2f4d] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm gap-4', 'h-16 bg-pl-surface border-b border-pl-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-pl-sm gap-4')}>
      {/* Left Section: Logo & Mobile Menu */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-fit">
        <button
          onClick={handleMenuToggle}
          className={tc('lg:hidden text-gray-400 hover:text-white transition-colors p-1', 'lg:hidden rounded-md p-1 text-pl-muted transition-colors hover:text-pl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus')}
          aria-label={tc(undefined, 'Open navigation')}
        >
          <Menu className="h-6 w-6" />
        </button>
        <PetroLordLogo />
      </div>

      {/* Center Section: Search Bar (Hidden on small screens) */}
      <div className="flex-1 flex justify-center max-w-2xl px-2 lg:px-8">
        <div className="hidden md:flex items-center relative w-full">
          <Search className={tc('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500', 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted')} />
          <input
            type="text"
            placeholder="Search incidents, observations..."
            className={tc('w-full h-9 pl-9 pr-4 bg-[#151525] border border-[#2f2f4d] rounded-md text-sm text-gray-200 focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-all placeholder:text-gray-600', 'w-full h-9 pl-9 pr-4 rounded-md border border-pl-border-strong bg-pl-surface text-sm text-pl-text placeholder:text-pl-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 ring-offset-pl-bg')}
          />
        </div>
      </div>

      {/* Right Section: User Controls & Actions */}
      <div className="flex items-center gap-2 md:gap-4 justify-end min-w-fit">
        {/* Safety Score Display */}
        <div className={tc('hidden xl:flex items-center gap-3 mr-2 bg-[#252541] px-3 py-1.5 rounded-full border border-[#3a3a5a]', 'hidden xl:flex items-center gap-3 mr-2 bg-pl-sunken px-3 py-1.5 rounded-full border border-pl-border')}>
           <div className={tc('flex items-center gap-1 text-[#FFC107]', 'flex items-center gap-1 text-pl-accent-text')}>
              <span className={tc('text-sm font-bold', 'text-sm font-bold font-pl-mono tabular-nums')}>{points}</span>
              <span className={tc('text-[10px] text-[#7a7a9a]', 'text-[10px] text-pl-muted')}>pts</span>
           </div>
           {streak > 0 && (
             <div className={tc('flex items-center gap-1 text-orange-400 pl-3 border-l border-[#3a3a5a]', 'flex items-center gap-1 text-pl-accent-text pl-3 border-l border-pl-border')} title={tc(undefined, `${streak} day streak`)}>
                <Flame className="h-3 w-3 fill-current" />
                <span className="text-xs font-bold">{streak}</span>
             </div>
           )}
        </div>

        <div className="hidden sm:block">
          <AppSwitcher />
        </div>

        {/* Quick Report Button */}
        <Button 
          onClick={() => setIsQuickReportOpen(true)}
          variant={tc('default', 'accent')}
          className={tc('bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold h-9 px-4 hidden sm:flex items-center gap-2 shadow-[0_0_15px_rgba(255,193,7,0.2)] animate-pulse hover:animate-none', 'font-semibold h-9 px-4 hidden sm:flex items-center gap-2')}
        >
          <Zap className={tc('h-4 w-4 fill-black', 'h-4 w-4 fill-current')} />
          <span className="hidden md:inline">Quick Report</span>
        </Button>

        {/* Light / dark switch (inside the design-system scope only) */}
        <ThemeToggle />

        {/* Notifications - Integrated NotificationCenter */}
        <NotificationCenter />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={tc('flex items-center gap-2 ml-1 focus:outline-none', 'flex items-center gap-2 ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus')} aria-label={tc(undefined, 'Account menu')}>
              <Avatar className={tc('h-9 w-9 border border-[#2f2f4d] cursor-pointer hover:border-[#FFC107] transition-colors', 'h-9 w-9 border border-pl-border cursor-pointer hover:border-pl-accent transition-colors')}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className={tc('bg-[#FFC107] text-black font-bold text-xs', 'bg-pl-accent text-pl-accent-fg font-bold text-xs')}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={tc('w-56 bg-[#1f1f35] border-[#2f2f4d] text-gray-200', 'w-56')}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className={tc('text-sm font-medium text-white leading-none', 'text-sm font-medium text-pl-text leading-none')}>
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className={tc('text-xs leading-none text-gray-500 truncate', 'text-xs leading-none text-pl-muted truncate')}>
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className={tc('bg-[#2f2f4d]', undefined)} />
            <div className="sm:hidden p-2">
               <AppSwitcher />
            </div>
            <div className="sm:hidden p-2">
               <Button onClick={() => setIsQuickReportOpen(true)} variant={tc('default', 'accent')} className={tc('w-full bg-[#FFC107] text-black h-8 text-xs font-bold mb-2', 'w-full h-8 text-xs font-semibold mb-2')}>
                  <Zap className="h-3 w-3 mr-1" /> Quick Report
               </Button>
            </div>
            <DropdownMenuSeparator className={tc('bg-[#2f2f4d]', undefined)} />
            <DropdownMenuItem className={tc('focus:bg-[#2f2f4d] cursor-pointer', 'cursor-pointer')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={tc('focus:bg-[#2f2f4d] cursor-pointer text-red-400 focus:text-red-400', 'cursor-pointer text-pl-danger-text focus:bg-pl-danger-bg focus:text-pl-danger-text')} onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <QuickReport isOpen={isQuickReportOpen} onClose={() => setIsQuickReportOpen(false)} />
    </header>
  );
};

export default TopBar;