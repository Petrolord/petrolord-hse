// The one design-system scope for the signed-in HSE app
// (docs/scope/DesignSystem-Rollout.md section 2).
//
// PetrolordHSE, the signed-in layout, renders this around the whole shell:
// the TopBar (which carries the ThemeToggle), the content column, the
// footer and the layout's dialogs. The LeftNav rail sits inside it as the
// fixed dark ink frame (InkRail), as the Suite's dashboard rail does.
//
// During the rollout the scope opens only while the active module is
// migrated (src/design/rollout); on every other module this renders its
// children with no wrapper at all, so an unmigrated screen is byte for byte
// what it was. The end-state wave removes the gate and the scope is always
// on.
//
// The public and auth pages never open this scope: they stay light (see the
// plan), and the homepage keeps its own family look (HomePage.css).
import React from 'react';
import { Loader2 } from 'lucide-react';
import { ThemedApp, FixedTheme, readLastTheme } from './ThemeProvider.jsx';
import { useDsTheme } from './themeContext.js';
import { DEFAULT_THEME } from './tokens.js';
import { isThemedModule } from './rollout/index.js';

export const SIGNED_IN_SCOPE_TEST_ID = 'hse-theme-scope';

/**
 * <SignedInScope moduleId={activeModule?.id}>...</SignedInScope>
 * A ThemedApp while `moduleId` is migrated; otherwise the children as they are.
 */
export function SignedInScope({ moduleId, className = 'min-h-screen', children, ...rest }) {
  if (!isThemedModule(moduleId)) return <>{children}</>;
  return (
    <ThemedApp className={className} data-testid={SIGNED_IN_SCOPE_TEST_ID} {...rest}>
      {children}
    </ThemedApp>
  );
}

/**
 * The ink rail: inside a scope the rail is a fixed dark frame in both themes
 * (no storage, no toggle), so its roles and its tooltips resolve to the dark
 * ink palette whatever the page beside it uses. Outside a scope it renders
 * its child untouched. The child reads the theme through useThemeClass.
 */
export function InkRail({ children }) {
  const ds = useDsTheme();
  if (!ds) return children;
  return (
    <FixedTheme theme="dark">
      <div data-pl-theme="dark" data-testid="hse-ink-rail" className="h-full">
        {children}
      </div>
    </FixedTheme>
  );
}

/**
 * Loader for the layout's own cold load (the organisation context is still
 * restoring). On a migrated module it paints this device's last theme, so a
 * dark user sees no light flash and a light user no dark one; elsewhere it
 * returns null and the caller keeps its legacy loader.
 */
export function ThemedLoadingScreen({ moduleId, label }) {
  if (!isThemedModule(moduleId)) return null;
  const theme = readLastTheme() || DEFAULT_THEME;
  return (
    <div
      data-pl-theme={theme}
      data-pl-root=""
      data-testid="hse-themed-loader"
      className="min-h-screen flex flex-col items-center justify-center bg-pl-bg text-pl-text"
    >
      <Loader2 className="h-12 w-12 text-pl-primary-text animate-spin mb-4" aria-hidden="true" />
      <p className="text-pl-muted animate-pulse">{label}</p>
    </div>
  );
}
