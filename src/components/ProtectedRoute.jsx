import React from 'react';
import { useHSE } from '@/context/HSEContext';
import { Shield } from 'lucide-react';

function ProtectedRoute({ children, requiredModule, requiredPermission }) {
  const { isAuthenticated, userPermissions } = useHSE();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="petrolord-card p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-[#FFC107] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e0e0e0] mb-2">
            Authentication Required
          </h2>
          <p className="text-[#b0b0c0] mb-6">
            Please sign in to access this content.
          </p>
          <button className="petrolord-button px-6 py-3 rounded-lg w-full">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (requiredModule && !userPermissions.modules.includes(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="petrolord-card p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-[#FF5252] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e0e0e0] mb-2">
            Access Denied
          </h2>
          <p className="text-[#b0b0c0] mb-2">
            You don't have permission to access this module.
          </p>
          <p className="text-sm text-[#7a7a9a]">
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  if (requiredPermission && !userPermissions[requiredPermission]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="petrolord-card p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-[#FF9800] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e0e0e0] mb-2">
            Insufficient Permissions
          </h2>
          <p className="text-[#b0b0c0]">
            You don't have the required permissions for this action.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;