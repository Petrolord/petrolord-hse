// The one design-system scope for the signed-in HSE app
// (docs/scope/DesignSystem-Rollout.md sections 4.1 and 7).
//
// PetrolordHSE, the signed-in layout, renders this around the whole shell:
// the TopBar (which carries the ThemeToggle), the content column, the
// footer and the layout's dialogs. The LeftNav rail sits inside it as the
// fixed dark ink frame (InkRail), as the Suite's dashboard rail does. Since
// batch 4A the scope opens on every module (the rollout gate is gone).
//
// The public and auth pages never open this scope: they stay light on the
// PublicPage frame, and the homepage keeps its own family look
// (HomePage.css).
import React from 'react';
import { Loader2 } from 'lucide-react';
import { ThemedApp, FixedTheme, readLastTheme } from './ThemeProvider.jsx';
import { DEFAULT_THEME } from './tokens.js';

export const SIGNED_IN_SCOPE_TEST_ID = 'hse-theme-scope';

/** <SignedInScope>...</SignedInScope>: the signed-in ThemedApp. */
export function SignedInScope({ className = 'min-h-screen', children, ...rest }) {
  return (
    <ThemedApp className={className} data-testid={SIGNED_IN_SCOPE_TEST_ID} {...rest}>
      {children}
    </ThemedApp>
  );
}

/**
 * The ink rail: a fixed dark frame in both themes (no storage, no toggle),
 * so its roles and its tooltips resolve to the dark ink palette whatever
 * the page beside it uses.
 */
export function InkRail({ children }) {
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
 * restoring). It is a scope of its own: it paints this device's last theme
 * (the signed-in user's stored choice once the session is known), so a dark
 * user sees no light flash and a light user no dark one, and it publishes
 * that theme (activeTheme.js), so the root pieces that follow the scope on
 * screen (the offline pill, the toaster) match it from the first frame.
 */
export function ThemedLoadingScreen({ label }) {
  return (
    <ThemedApp
      defaultTheme={readLastTheme() || DEFAULT_THEME}
      data-testid="hse-themed-loader"
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center bg-pl-bg text-pl-text"
    >
      <Loader2 className="h-12 w-12 text-pl-primary-text animate-spin mb-4" aria-hidden="true" />
      <p className="text-pl-muted animate-pulse">{label}</p>
    </ThemedApp>
  );
}
