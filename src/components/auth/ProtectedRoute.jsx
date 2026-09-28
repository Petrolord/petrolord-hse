import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useHSE } from '@/context/HSEContext';
import { useAppState } from '@/context/AppStateContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AccountScope } from '@/components/account/accountChrome';
import { ThemedApp, readLastTheme } from '@/design/ThemeProvider';
import { DEFAULT_THEME } from '@/design/tokens';
import { isThemedModule } from '@/design/rollout';

// Design system (docs/scope/DesignSystem-Rollout.md sections 2.3 and 4.2,
// batch 3A). The signed-in pages that sit outside the HSE layout open their
// own scope through AccountScope; every other protected path is the layout
// (PetrolordHSE), themed module by module.
export const OUTSIDE_LAYOUT_PATHS = Object.freeze([
  '/dashboard/upgrade',
  '/dashboard/analytics/advanced',
  '/dashboard/super-admin/branding',
  '/suite',
  '/organization',
  '/auditor',
]);

const underPrefix = (p, pre) => p === pre || p.startsWith(`${pre}/`);

/** True when `pathname` is a signed-in page outside the layout. */
export function isOutsideLayoutPath(pathname) {
  if (typeof pathname !== 'string') return false;
  const p = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return OUTSIDE_LAYOUT_PATHS.some((pre) => underPrefix(p, pre));
}

/**
 * The theme the cold-load loader paints on `pathname`, or null for the
 * legacy loader: the pages outside the layout always open a scope, and on
 * the layout it follows the rollout for the module being restored. The
 * device's last theme stands in while the session restores.
 */
export function protectedLoaderTheme(pathname, moduleId) {
  if (!isOutsideLayoutPath(pathname) && !isThemedModule(moduleId)) return null;
  return readLastTheme() || DEFAULT_THEME;
}

export const ProtectedRoute = ({ requiredRole, requirePremium = false }) => {
  const { isAuthenticated, isLoading, role, accessLevel, checkPermission, activeModule } = useHSE();
  const { persistedModule } = useAppState();
  const location = useLocation();

  if (isLoading) {
    const theme = protectedLoaderTheme(location.pathname, activeModule?.id || persistedModule?.id);
    if (theme) {
      return (
        // A scope of its own (not a bare themed div), so the root pieces
        // that follow the scope on screen (the toaster, the offline pill)
        // match the loader. The user's stored choice wins once known.
        <ThemedApp
          defaultTheme={theme}
          data-testid="protected-route-loader"
          role="status"
          aria-live="polite"
          className="h-screen w-full flex items-center justify-center text-pl-text"
        >
          <Loader2 className="h-8 w-8 animate-spin text-pl-primary-text" aria-hidden="true" />
          <span className="ml-2 text-pl-muted">Verifying access...</span>
        </ThemedApp>
      );
    }
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
  // The denied panels replace the whole page, so they open a scope of
  // their own (AccountScope) and follow the user's choice on every path.
  if (accessLevel === 'none') {
    return (
      <AccountScope testId="protected-route-denied" className="flex flex-col items-center justify-center p-4 text-center text-pl-text">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-pl-danger/40 bg-pl-danger-bg">
          <ShieldAlert className="h-9 w-9 text-pl-danger-text" aria-hidden="true" />
        </span>
        <h1 className="font-pl-display text-2xl font-semibold text-pl-text mb-2">Access Restricted</h1>
        <p className="text-pl-muted max-w-md">
          Your organization does not have an active HSE module subscription. Please contact your administrator.
        </p>
      </AccountScope>
    );
  }

  // 2. Check Role Requirement
  if (requiredRole && !checkPermission(requiredRole)) {
     return <Navigate to="/" replace />;
  }

  // 3. Check Premium Requirement
  if (requirePremium && accessLevel !== 'premium') {
     return (
      <AccountScope testId="protected-route-denied" className="flex flex-col items-center justify-center p-4 text-center text-pl-text">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-pl-accent/40 bg-pl-accent/15">
          <ShieldAlert className="h-9 w-9 text-pl-accent-text" aria-hidden="true" />
        </span>
        <h1 className="font-pl-display text-2xl font-semibold text-pl-text mb-2">Premium Feature</h1>
        <p className="text-pl-muted max-w-md mb-6">
          This section requires a Premium subscription. Please upgrade your plan to access this feature.
        </p>
      </AccountScope>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
