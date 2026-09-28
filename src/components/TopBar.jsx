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

// The signed-in header, on the theme roles, with the ThemeToggle.

const TopBar = ({ toggleMobileMenu, onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const { currentUser, currentOrganization } = useHSE();
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  // The account menu is controlled so its phone Quick Report button can close
  // it before the report opens (batch 4B).
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

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
    <header className="h-16 bg-pl-surface border-b border-pl-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-pl-sm gap-4">
      {/* Left Section: Logo & Mobile Menu */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-fit">
        <button
          onClick={handleMenuToggle}
          className="lg:hidden rounded-md p-1 text-pl-muted transition-colors hover:text-pl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus"
          aria-label="Open navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* inside the scope the wordmark shrinks on a phone so the theme toggle,
            notifications and the account menu all fit */}
        <PetroLordLogo className="[&_img]:h-7 sm:[&_img]:h-10" />
      </div>

      {/* Center Section: Search Bar (Hidden on small screens) */}
      <div className="hidden md:flex flex-1 justify-center max-w-2xl px-2 lg:px-8">
        <div className="hidden md:flex items-center relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" />
          <input
            type="text"
            placeholder="Search incidents, observations..."
            className="w-full h-9 pl-9 pr-4 rounded-md border border-pl-border-strong bg-pl-surface text-sm text-pl-text placeholder:text-pl-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 ring-offset-pl-bg"
          />
        </div>
      </div>

      {/* Right Section: User Controls & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 justify-end min-w-fit">
        {/* Safety Score Display */}
        <div className="hidden xl:flex items-center gap-3 mr-2 bg-pl-sunken px-3 py-1.5 rounded-full border border-pl-border">
           <div className="flex items-center gap-1 text-pl-accent-text">
              <span className="text-sm font-bold font-pl-mono tabular-nums">{points}</span>
              <span className="text-[10px] text-pl-muted">pts</span>
           </div>
           {streak > 0 && (
             <div className="flex items-center gap-1 text-pl-accent-text pl-3 border-l border-pl-border" title={`${streak} day streak`}>
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
          variant="accent"
          className="font-semibold h-9 px-4 hidden sm:flex items-center gap-2"
        >
          <Zap className="h-4 w-4 fill-current" />
          <span className="hidden md:inline">Quick Report</span>
        </Button>

        {/* Light / dark switch (inside the design-system scope only) */}
        <ThemeToggle />

        {/* Notifications - Integrated NotificationCenter */}
        <NotificationCenter />

        {/* User Profile */}
        <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus" aria-label="Account menu">
              <Avatar className="h-9 w-9 border border-pl-border cursor-pointer hover:border-pl-accent transition-colors">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-pl-accent text-pl-accent-fg font-bold text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-pl-text leading-none">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-pl-muted truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="sm:hidden p-2">
               <AppSwitcher />
            </div>
            <div className="sm:hidden p-2">
               <Button
                 onClick={() => { setAccountMenuOpen(false); setIsQuickReportOpen(true); }}
                 variant="accent"
                 className="w-full h-8 text-xs font-semibold mb-2"
               >
                  <Zap className="h-3 w-3 mr-1" /> Quick Report
               </Button>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-pl-danger-text focus:bg-pl-danger-bg focus:text-pl-danger-text" onClick={handleLogout}>
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