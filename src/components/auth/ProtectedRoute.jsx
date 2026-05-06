import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useHSE } from '@/context/HSEContext';
import { Loader2, ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ requiredRole, requirePremium = false }) => {
  const { isAuthenticated, isLoading, role, accessLevel, checkPermission } = useHSE();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
        <span className="ml-2 text-[#b0b0c0]">Verifying access...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated, saving the attempted location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // SUPER ADMIN BYPASS:
  if (role === 'super_admin') {
    return <Outlet />;
  }

  // 1. Check basic HSE Access for regular users
  if (accessLevel === 'none') {
    return (
       <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a1a2e] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
        <p className="text-[#b0b0c0] max-w-md">
          Your organization does not have an active HSE module subscription. Please contact your administrator.
        </p>
      </div>
    );
  }

  // 2. Check Role Requirement
  if (requiredRole && !checkPermission(requiredRole)) {
     return <Navigate to="/" replace />; 
  }

  // 3. Check Premium Requirement
  if (requirePremium && accessLevel !== 'premium') {
     return (
       <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a1a2e] text-center p-4">
        <div className="bg-[#FFC107]/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-[#FFC107]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Premium Feature</h1>
        <p className="text-[#b0b0c0] max-w-md mb-6">
          This section requires a Premium subscription. Please upgrade your plan to access this feature.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;