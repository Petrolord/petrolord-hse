import React from 'react';
import { motion } from 'framer-motion';
import { useHSE } from '@/context/HSEContext';
import { ChevronRight, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PetroLordLogo from '@/components/layout/PetroLordLogo';

function DashboardLayout({ children, title, description, actions }) {
  const { currentOrganization, currentUser, role } = useHSE();

  return (
    <div className="min-h-full bg-[#1a1a2e] text-[#e0e0e0]">
      {/* Top Header Area */}
      <header className="bg-[#252541] border-b border-[#3a3a5a] sticky top-0 z-30">
        <div className="px-6 py-3 flex justify-between items-center">
          {/* Breadcrumbs / Context / Logo */}
          <div className="flex items-center gap-4 text-sm">
            <PetroLordLogo className="h-8 w-auto" />
            <div className="hidden sm:flex items-center gap-2 border-l border-[#3a3a5a] pl-4">
              <span className="text-[#b0b0c0] font-medium">
                {currentOrganization?.name || 'Organization'}
              </span>
              <ChevronRight className="h-4 w-4 text-[#7a7a9a]" />
              <span className="text-[#FFC107] font-semibold tracking-wide uppercase text-xs sm:text-sm">
                {role?.replace('_', ' ')} Dashboard
              </span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a9a]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-full pl-9 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-[#FFC107] focus:border-[#FFC107] w-64 text-[#e0e0e0] placeholder-[#7a7a9a]"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-[#b0b0c0] hover:text-[#FFC107] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <div className="h-8 w-8 rounded-full bg-[#3a3a5a] flex items-center justify-center border border-[#4a4a6a] overflow-hidden">
                     {currentUser?.avatar ? (
                       <img src={currentUser.avatar} alt="User" className="h-full w-full object-cover" />
                     ) : (
                       <User className="h-4 w-4 text-[#FFC107]" />
                     )}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#252541] border-[#3a3a5a] text-[#e0e0e0]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                    <p className="text-xs leading-none text-[#b0b0c0]">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#3a3a5a]" />
                <DropdownMenuItem className="focus:bg-[#3a3a5a] focus:text-[#FFC107]">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#3a3a5a] focus:text-[#FFC107]">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#3a3a5a]" />
                <DropdownMenuItem className="focus:bg-[#3a3a5a] focus:text-red-400">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Page Content Header */}
      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-1">{title}</h1>
            {description && <p className="text-[#b0b0c0]">{description}</p>}
          </motion.div>
          
          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3"
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardLayout;