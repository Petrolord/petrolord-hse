# Petrolord HSE: design family rollout

Owner decisions, 2026-09-28: the Petrolord design family that the Suite
finished on 2026-09-28 extends to HSE and NextGen. Grey panel light is the
default, inputs keep the Suite input styling, dark is a per-user choice from a
header toggle (and the user can always switch back), and charts stay white.

This document is the plan of record for HSE: the inventory of every routed
screen, the scope strategy, the batches, the shared pieces, charts and
canvases, the test strategy and what wave 0 (this PR) put in place. The
family's rules are the Suite's `docs/scope/DesignSystem.md` (Petrolord/petrolord-suite);
this file records only what is HSE specific.

Measured on main `9614e76` (#21) plus the wave 0 branch, 2026-09-28.

## 0. Summary

| | count |
|---|---|
| signed-in modules (MainContent `activeModule.id`) | 24 |
| migrated in wave 0 | 2 (`dashboard`, `ai-analytics`) plus the shell chrome |
| signed-in pages outside the layout | 6 routes plus the root loaders |
| public and auth pages | 16 routes, plus the homepage (stays as it is) |
| unreachable component files (not routed) | 124 of 387 |
| batches after wave 0 | 10 in three parallel waves, then 2 end-state sessions |
| estimated effort after wave 0 | about 34 VRR-equivalents |

| wave | batches | parallel |
|---|---|---|
| 0 | plumbing, ui kit, shell chrome, dashboard pilot (this PR) | done |
| 1 | 1A reporting (shell dialogs, My Reports), 1B operations tracking, 1C organisation admin | yes |
| 2 | 2A environment and risk, 2B health, hygiene, statistics, security, 2C knowledge and help, 2D operations registers and settings | yes |
| 3 | 3A signed-in pages outside the layout, 3B auth pages, 3C public pages | yes (3A after 1C) |
| 4 | 4A end state (gate off, legacy branches out), 4B cleanup and chart watermark | in sequence |

## 1. How the inventory was measured

A throwaway script (not committed) walked the import graph from every route
element in `src/App.jsx` and from every `case` in
`src/components/MainContent.jsx`, the switch that renders the signed-in
modules. HSE routes its modules by state (`activeModule.id`, persisted by
`AppStateContext`), so all 24 modules live under the one route
`/dashboard/*`.

- **Own files**: reachable from exactly one entry. Shared files are listed
  separately with the entries that pull them.
- **Legacy**: class tokens in own files that paint the legacy palette: grey
  and white or black utilities, hex arbitrary values (`bg-[#252541]`, the
  bulk of HSE) and gradients.
- **Vars**: `bg-[var(--bg-card)]` and the other legacy HSE palette
  variables. Inside a scope they keep painting the legacy palette (the scope
  does not re-point them, section 4.3), so they count as legacy too.
- **Hues**: red, amber, green, blue and the other hues. Status is allowed
  through the status roles, so each needs a decision.
- **Effort (VRR)**: the Suite's measure, `0.3 + 0.7 x (legacy + 0.25 x vars + 0.5 x hues) / 178.5`,
  so one VRR is the Suite's Voidage Replacement Monitor before its
  migration. A batch is 3 to 4 VRR, one agent session.

The duplicate trees in the gotchas memo are real: 124 component files are not
reachable from `App.jsx` (27 unused ui files, `components/dashboards/*`,
`components/hse/incidents|observations|supervisor/*`, `DashboardRouter`,
`SideNavigation`, `ai/AIAnalyticsDashboard` and others). They are out of the
rollout and go in 4B. `PredictiveInsightsDashboard` has importers in that dead
set (`SuperAdminDashboard`, `AIAnalyticsDashboard`); only the dashboard and
the `ai-analytics` module route it.

## 2. Inventory

Columns: own files, legacy, vars, hues, charts (recharts files), effort, the
shared files still legacy and the batch. "Tabs" are the in-module screens a
batch must check in both themes.

### 2.1 Signed-in shell (the layout around every module)

| Piece | Files | State after wave 0 | Batch |
|---|---|---|---|
| Layout | `PetrolordHSE.jsx`, `MainContent.jsx` | scope-aware (`useThemeClass`), opens `SignedInScope` | done |
| Header | `TopBar.jsx` (search, points chip, Quick Report, ThemeToggle, notifications, account menu) | scope-aware | done |
| Rail | `LeftNav.jsx` (desktop and phone drawer) | scope-aware, fixed dark ink inside the scope (`InkRail`) | done |
| App switcher | `layout/AppSwitcher.jsx` | scope-aware | done |
| Notifications | `notifications/NotificationCenter.jsx` | scope-aware | done |
| Assistant | `ai/ChatBot.jsx` | scope-aware | done |
| Quick Report flow | `hse/QuickReport.jsx`, `QuickReportSteps/CaptureStep.jsx`, `AnalyzingStep.jsx`, `QuickReportPreview.jsx`, `QuickReportSuccess.jsx` (about 315 legacy tokens) | legacy | 1A |
| Report Wizard | `hse/ReportWizard.jsx`, `ReportTemplates.jsx`, `sites/LocationAutocomplete.jsx`, `sites/InteractiveMap.jsx` (Leaflet), the wizard dialog in `PetrolordHSE` (about 230) | legacy | 1A |
| Upgrade modal | `layout/UpgradeModal.jsx` (33) | legacy | 1A |

The Quick Report and Report Wizard dialogs open from the TopBar on every
module, so they stay scope-aware (`useThemeClass`) in 1A, with their legacy DOM
added to `shellLegacyDom.test.jsx` before they change.

### 2.2 Signed-in modules (MainContent)

| Module id | Screen | Entry | Tabs | Own files | Legacy | Vars | Hues | Charts | Effort | Shared still legacy | Batch |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dashboard` | HSE Dashboard | `hse/HSEDashboard.jsx` | setup checklist, AI forecast (embedded), KPI tiles | 6 | 0 (WorldHeatmap is switched off) | 0 | 0 | 0 | done | - | 0 |
| `ai-analytics` | AI Safety Predictor | `analytics/PredictiveInsightsDashboard.jsx` | AI Forecast, Basic Metrics | 2 | 0 | 0 | 0 | 1 | done | - | 0 |
| `my-reports` | My Reports | `hse/MyReportsModule.jsx` | status filters | 3 | 91 | 1 | 38 | 0 | 0.73 | - | 1A |
| `supervisor-dashboard` | Supervisor View | `hse/SupervisorDashboardModule.jsx` | status and severity filters | 2 | 136 | 0 | 59 | 0 | 0.95 | - | 1B |
| `actions` | Action Tracker | `hse/ActionTrackingModule.jsx` | all, mine, overdue, high, this week | 8 | 198 | 0 | 55 | 0 | 1.18 | - | 1B |
| `permits` | Work Permits | `hse/WorkPermitsModule.jsx` | dashboard, permits, approvals, templates | 6 | 149 | 26 | 77 | 0 | 1.06 | - | 1B |
| `admin-setup-hub` | Setup Hub | `hse/admin/OrgSetupHub.jsx` | | 1 | 19 | 0 | 10 | 0 | 0.39 | - | 1C |
| `admin-sites` | Sites | `hse/admin/SitesAdmin.jsx` | site types | 1 | 70 | 0 | 25 | 0 | 0.62 | - | 1C |
| `admin-departments` | Departments | `hse/admin/DepartmentsAdmin.jsx` | | 1 | 38 | 0 | 11 | 0 | 0.47 | - | 1C |
| `team` | Members | `hse/team/TeamManagementModule.jsx` | | 2 | 57 | 0 | 44 | 0 | 0.61 | OrganizationMembers (also `/organization`) | 1C |
| `environment` | Environment | `petrolord/EnvironmentModule.jsx` | dashboard, emissions, monitoring, spills, waste, obligations, studies, decom, reporting | 16 | 338 | 0 | 72 | 0 | 1.77 | RowActions (with risk) | 2A |
| `risk` | Risk Management | `petrolord/RiskManagementModule.jsx` | dashboard, register, assessment, mitigation, monitoring, reporting, analytics, appetite, scenario, culture | 15 | 350 | 0 | 129 | 2 | 1.93 | RowActions (with environment) | 2A |
| `health` | Health | `petrolord/health/HealthModule.jsx` | dashboard, incidents, hazards, inspections, actions, permits, contractors, training, fire, analytics | 5 | 118 | 0 | 26 | 1 | 0.81 | - | 2B |
| `occupational-hygiene` | Occupational Hygiene | `hse/hygiene/OccupationalHygieneModule.jsx` | noise, chemical, heat, records | 7 | 92 | 1 | 28 | 3 | 0.72 | safety-stats/common (with statistics) | 2B |
| `safety-statistics` | Safety Statistics | `hse/safety-stats/SafetyStatisticsModule.jsx` | overview, trends, compare, hours | 6 | 103 | 1 | 14 | 1 | 0.73 | safety-stats/common (with hygiene) | 2B |
| `security` | Security | `hse/security/SecurityModule.jsx` | dashboard, incidents, access, threats, awareness, behavior, compliance, team, analytics | 14 | 177 | 0 | 58 | 2 | 1.11 | - | 2B |
| `safety-moments-bank` | Safety Moments | `hse/safety-moments/SafetyMomentsBankModule.jsx` | dashboard, library, saved | 7 | 284 | 1 | 43 | 0 | 1.50 | - | 2C |
| `help` | Help Centre | `help/HelpCenter.jsx` | start, modules, workflows, faqs, support | 9 | 226 | 0 | 28 | 0 | 1.24 | - | 2C |
| `leaderboard` | Leaderboard | `hse/LeaderboardModule.jsx` | | 4 | 56 | 1 | 20 | 0 | 0.56 | - | 2C |
| `analytics` | Analytics | `hse/analytics/AnalyticsDashboardModule.jsx` | 7, 30, 90 days | 1 | 32 | 0 | 2 | 1 | 0.43 | - | 2D |
| `contractor` | Contractor Safety | `hse/contractor/ContractorSafetyModule.jsx` | dashboard, contractors, inductions, briefings, permits, incidents, training, compliance | 10 | 148 | 1 | 33 | 0 | 0.95 | - | 2D |
| `audit` | Safety Audits | `hse/audit/SafetyAuditModule.jsx` | schedule, internal, findings, reports | 4 | 73 | 2 | 15 | 0 | 0.62 | - | 2D |
| `training` | Training | `hse/training/TrainingCompetencyModule.jsx` | dashboard, programs, schedule, records, competency, assessments | 4 | 77 | 2 | 13 | 1 | 0.63 | - | 2D |
| `settings` | Settings | `admin/OrgAdminSettings.jsx` | branding, departments, compliance, profile | 16 | 52 | 125 | 19 | 0 | 0.66 | - | 2D |

### 2.3 Signed-in pages outside the layout

These routes sit under `ProtectedRoute` but outside `PetrolordHSE`, so they
open their own scope (`AccountScope`, section 4.2).

| Route | Entry | Own files | Legacy | Hues | Effort | Batch |
|---|---|---|---|---|---|---|
| `/organization` | `pages/OrganizationSettings.jsx` | 5 | 197 | 68 | 1.21 | 1C (shares OrganizationMembers with `team`) |
| `/dashboard/upgrade` | `pages/UpgradePage.jsx` | 1 | 53 | 5 | 0.52 | 3A |
| `/dashboard/analytics/advanced` | `hse/analytics/AdvancedAnalyticsDashboard.jsx` | 1 | 7 | 0 | 0.33 | 3A |
| `/suite/*` | `suite/SuiteDashboard.jsx` | 1 | 20 | 21 | 0.42 | 3A |
| `/dashboard/super-admin/branding` | `pages/SuperAdminBrandingPage.jsx` | 11 | 168 | 15 | 0.99 | 3A |
| `/auditor` | `admin/SafetyContentAuditor.jsx` | 1 | 43 | 11 | 0.49 | 3A |
| root loaders | `auth/ProtectedRoute.jsx`, `ErrorBoundary.jsx`, `common/OfflineIndicator.jsx`, `PWAInstallPrompt`, `BackgroundSync` | 3 | 25 | 10 | 0.70 | 3A |

### 2.4 Public and auth pages

Always light, no toggle (section 4.4). The homepage is out of the rollout.

| Route | Entry | Own files | Legacy | Hues | Effort | Batch |
|---|---|---|---|---|---|---|
| `/` | `pages/HomePage.jsx` + `HomePage.css` (`.hse-home`, #21) | 1 | 0 | 0 | - | stays as it is |
| `/login` | `auth/SignIn.jsx` | 1 | 31 | 5 | 0.43 | 3B |
| `/signup` | `auth/OrganizationSignup.jsx` | 1 | 83 | 43 | 0.71 | 3B |
| `/forgot-password` | `auth/ForgotPassword.jsx` | 1 | 25 | 0 | 0.40 | 3B |
| `/auth/reset-password` | `auth/SetPassword.jsx` | 1 | 25 | 1 | 0.40 | 3B |
| `/accept-invite/:token` | `auth/InvitationAcceptance.jsx` | 1 | 57 | 11 | 0.55 | 3B |
| `/auth/callback` | `auth/AuthCallback.jsx` | 1 | 4 | 0 | 0.32 | 3B |
| `/auth/confirm` | `auth/ConfirmationPage.jsx` | 1 | 9 | 3 | 0.34 | 3B |
| `/auth/registration-confirmation` | `auth/RegistrationConfirmation.jsx` | 1 | 20 | 9 | 0.40 | 3B |
| `/pricing` | `pages/PricingPage.jsx` | 7 | 94 | 11 | 0.69 | 3C |
| `/benefits/:slug` | `pages/BenefitPage.jsx` | 9 | 66 | 9 | 0.58 | 3C |
| `/privacy-policy`, `/terms-of-service`, `/security` | `pages/*Page.jsx` | 3 | 19 | 4 | 0.98 | 3C |
| `/payment/verify` | `pages/PaymentVerifyPage.jsx` | 1 | 18 | 2 | 0.37 | 3C |
| `/observe/:token` | `public/PublicObservation.jsx` (QR observation, phone first) | 1 | 45 | 17 | 0.51 | 3C |

Shared by the public pages (batch 3C owns them outright): `layout/PublicNavbar`,
`layout/PublicFooter`, `documentation/DocumentationSection`,
`TableOfContents`, `DocumentationHeader`. `branding/BrandingGuide` is also
imported by the shell (`PetroLordLogo` reads its `PETROLORD_BRANDING`
constants); 3C may restyle its component but leaves the constants alone.

## 3. Batches

### 3.1 Rules for parallel work

- One batch, one agent session, one branch, one PR, 3 to 4 VRR.
- A batch touches only its own modules' files (section 2), their tests and
  its own rollout file `src/design/rollout/w<batch>.js`, where it lists the
  module ids it migrated. It never edits `rollout/index.js` or another
  batch's file.
- A file two batches pull is either owned by one batch that has every
  consumer (the "shared" column), or made scope-aware with `useThemeClass`
  with its legacy DOM pinned first.
- `src/design/**` and the ui kit change only in wave 0 and wave 4.
- No behaviour or calculation change. The module's existing tests pass
  unchanged.
- Work in a worktree. The primary checkout is the staging mount
  (`plstudio-hse-dev` serves it on hse.studio.petrolord.com with live HMR),
  so it stays untouched.

### 3.2 The batch list

| Batch | Contents | Effort | Needs |
|---|---|---|---|
| **1A** Reporting | the Quick Report flow and Report Wizard dialogs (scope-aware, pinned), UpgradeModal, the layout's wizard dialog and success toast; My Reports | 3.3 | wave 0 |
| **1B** Operations tracking | Supervisor View, Action Tracker, Work Permits | 3.2 | wave 0 |
| **1C** Organisation admin | Setup Hub, Sites, Departments, Members, `/organization` (owns OrganizationMembers); ports the Suite's `AccountScope` for pages outside the layout | 3.3 | wave 0 |
| **2A** Environment and risk | Environment (9 tabs), Risk Management (10 tabs), RowActions | 3.7 | wave 0 |
| **2B** Health and statistics | Health, Occupational Hygiene, Safety Statistics (own safety-stats/common), Security | 3.4 | wave 0 |
| **2C** Knowledge and help | Safety Moments, Help Centre (guides render code-driven content), Leaderboard | 3.3 | wave 0 |
| **2D** Registers and settings | Analytics, Contractor Safety, Safety Audits, Training, Settings (125 legacy var classes) | 3.3 | wave 0 |
| **3A** Outside the layout | `/dashboard/upgrade`, `/dashboard/analytics/advanced`, `/suite/*`, `/dashboard/super-admin/branding`, `/auditor`, the root loaders and error panels | 3.5 | 1C (AccountScope) |
| **3B** Auth pages | the 8 auth routes on a `PublicPage` frame (port of the Suite's), always light | 3.6 | wave 0 |
| **3C** Public pages | pricing, benefits, legal and security pages, payment verify, QR observation, the public navbar, footer and documentation pieces | 3.1 | 3B (PublicPage) |
| **4A** End state | section 7 | about 2 | all of 1 to 3 |
| **4B** Cleanup | delete the 124 unreachable files and unused ui files; chart watermark (section 6); final walk | about 1.5 | 4A |

Order. Wave 1 carries what every user meets after the dashboard: the Quick
Report and wizard (the most used action), their own reports and actions, and
the admin setup pages the launch checklist sends a new organisation to.
Wave 2 takes the HSSE pillars. Wave 3 is everything outside the layout.

### 3.3 Per-module recipe

1. Add the module id to your batch's `src/design/rollout/w<batch>.js`. The
   layout then opens the scope around it.
2. Replace the module's own legacy classes with roles: `bg-[#252541]` and
   `bg-[var(--bg-card)]` become `bg-pl-surface`, `text-white` becomes
   `text-pl-text`, `text-[#7a7a9a]` and `text-gray-400` become
   `text-pl-muted`, borders `border-pl-border`. Drop overrides on adapted
   primitives (`Card`, `Input`, `DialogContent`, `TabsList`), because
   tailwind-merge lets them win. No `dark:` variants (section 5.2).
3. Colour for status only, through the status roles (`Badge`
   `success|warning|danger|info`, `Alert` status variants,
   `bg-pl-danger` dots with a word beside them). Decorative purple, cyan and
   gradient accents go.
4. Charts: `ChartPanel` (white in both themes) with the colours in
   `src/utils/chartTheme.js` (section 6).
5. Numbers: `font-pl-mono tabular-nums`. Page titles may use
   `font-pl-display`; nothing else does.
6. Copy pass on every string touched: no em dashes, no "X, not Y", "rather
   than", ", never" or "instead of"; spell out arrows.
7. Add `src/components/<area>/__tests__/<Module>.theme.test.jsx` with
   `describeModuleTheme` (section 8) and further states with
   `expectNoLegacyChrome`.
8. Look at it: light and dark at 1440 and 390 (section 8.4). No sideways
   page scroll.

## 4. Scope strategy

### 4.1 One scope at the signed-in layout (recommended, built in wave 0)

`PetrolordHSE`, the signed-in layout, renders `SignedInScope`
(`src/design/SignedInScope.jsx`, one `ThemedApp`) around the whole shell:
TopBar, rail, the module, the footer and the layout's dialogs. The
`ThemeToggle` sits in the TopBar, so one choice themes the whole app and holds
while the user moves between modules. This is the Suite's end state (one
`DashboardScope` at `DashboardLayout`), reached from the start.

- **Rollout gate.** Until wave 4 the scope opens only while the active
  module is in a rollout list (`src/design/rollout/`). On every other module
  `SignedInScope` renders its children with no wrapper, and the shell pieces
  render their legacy classes byte for byte (`shellLegacyDom.test.jsx`). So a
  user sees the family on migrated modules, and the legacy console, with no
  toggle, on the rest. Moving between them changes the whole page at once;
  a half themed page is never shown.
- **The rail** is the fixed dark ink frame in both themes (`InkRail` gives it
  `data-pl-theme="dark"` inside a `FixedTheme`), as the Suite's dashboard rail
  is (Suite lead decision 1). Its tooltips follow it.
- **Cold load.** The layout's own loader paints the device's last theme
  (`petrolord.theme.v1.last`) on a migrated module. `ThemedApp` does the same
  while the session restores.
- **Toasts** follow the scope on screen (`activeTheme.js`); on an unmigrated
  module they stay legacy.

### 4.2 Signed-in pages outside the layout

The six routes in 2.3 and the root error and loading states open their own
scope through a port of the Suite's `AccountScope` (per-user, same storage
key), created in 1C. Their header carries a `ThemeToggle`.

### 4.3 Variables the scope re-points, and the ones it leaves

`theme.css` re-points the shadcn variables HSE declares as HSL triplets
(`--background`, `--card`, `--popover`, `--muted`, `--primary`,
`--accent-ui`, `--border`, `--input`, `--ring` ...), so stock token classes
follow the theme inside a scope, as in the Suite. It does not re-point
`--accent` (HSE's raw hex brand amber, used as `var(--accent)`) or the legacy
palette variables (`--bg-app`, `--bg-card`, `--text-primary`,
`--border-color` ...): a component still on those keeps its legacy look
until its batch moves it to roles, so a mixed component never turns to
unreadable text. A plain `border` inside a scope takes the hairline role
(`:where([data-pl-theme] *)`, zero specificity).

### 4.4 Public and auth pages: always light

The auth and public pages (2.4) render light with no toggle, on a port of the
Suite's `PublicPage` frame (3B), whatever the visitor chose inside the app:
one look from sign-in to the app, the Suite's behaviour. The QR observation
page (`/observe/:token`) is used by anonymous workers on phones and stays
light.

### 4.5 What stays out

- **The homepage** keeps the family look from #21 (`HomePage.css`, every rule
  scoped under `.hse-home`, pinned by `HomePage.test.jsx`), as the Suite's
  homepage keeps `Home.css`. It opens no scope.
- The 124 unreachable component files (section 1).
- `WorldHeatmap` on the dashboard is switched off in code (`false &&`); it is
  migrated when it returns with real data.

## 5. Shared components

### 5.1 The ui kit: themed inside a scope, legacy outside (wave 0)

The 28 ui primitives the routed screens use (accordion, alert, alert-dialog,
avatar, badge, button, calendar, card, checkbox, dialog, dropdown-menu, input,
label, popover, progress, scroll-area, select, separator, sheet, skeleton,
slider, switch, table, tabs, textarea, toast, toaster, tooltip) read the
nearest scope. Inside one they render the Suite kit's role strings (the Suite
input styling, raised menus and dialogs, sunken tab rail, Badge and Alert
status variants, Button `accent` and `xs`); outside one they render their
legacy strings unchanged. Portal content (dialogs, menus, selects, popovers,
tooltips, sheets) carries the scope attribute through `usePortalThemeProps`.
The 27 unused ui files are left for 4B.

Why two branches, when the scope already re-points the shadcn variables:

1. **The legacy screens must not move.** 22 modules and every page outside
   the layout keep using the kit until their batch lands. HSE's GlobalTheme
   puts `dark` on `<html>`, and several primitives carry `dark:` variants
   and stock light defaults; changing a class string would change those
   screens. `uiLegacyDom.test.jsx` pins every primitive, portals open,
   byte for byte against a capture from main taken before any edit.
2. **Variables alone do not give the Suite look.** The Suite kit differs in
   structure as well as colour: inputs sit on the surface with the strong
   border and the gold focus ring, menus are raised with a shadow, the tab
   rail has a border, Badge and Alert have status variants, Button has
   `accent` and `xs`, Label is a block. The owner asked for the current
   Suite input styling, which needs the Suite strings.
3. **It is the Suite's own path.** The Suite did exactly this in its Wave 0
   (`useThemeClass`, legacy DOM pinned) and deleted the legacy branches in
   7B once every page sat in a scope. HSE's 4A does the same.

The helper is `useThemeClass()` (`src/design/themeClass.js`):
`tc(legacy, themed)` returns `legacy` outside a scope and `themed` inside;
`tc(legacy, undefined)` drops a class inside a scope. The cva primitives pick
between a legacy and a themed variant set (`useButtonVariants()` for pieces
that reuse the button look).

### 5.2 Rules for batch code

- No `dark:` variants in themed code. HSE sets `.dark` on `<html>` from the
  organisation's branding, so a `dark:` class really paints inside a light
  scope. The theme test counts them as legacy.
- No `var(--bg-*)`, `var(--text-*)`, `var(--border-color)`, `var(--accent)`
  or `petrolord-card` / `petrolord-button` in themed code (section 4.3).

### 5.3 Other shared files

| File | Consumers | Plan |
|---|---|---|
| `components/organization/OrganizationMembers.jsx` | `team`, `/organization` | batch-local to 1C |
| `components/petrolord/common/RowActions.jsx` | `environment`, `risk` | batch-local to 2A |
| `components/hse/safety-stats/common.jsx` | `safety-statistics`, `occupational-hygiene` | batch-local to 2B |
| Quick Report and Report Wizard dialogs | every module (TopBar) | 1A, scope-aware and pinned |
| Public navbar, footer, documentation pieces | public pages | batch-local to 3C |
| `branding/BrandingGuide.jsx` | public pages, shell (constants only) | 3C, constants untouched |

## 6. Charts and canvases

- **Charts stay white in both themes.** Put every chart in a `ChartPanel`
  (`src/components/ui/chart-panel.jsx`, `data-canvas="chart"`), which pins
  the light roles around it, and take the colours from
  `src/utils/chartTheme.js` (the Suite's chart standard values: grid, axes,
  tooltip, legend and the five series colours). Do not restyle a chart per
  theme. The pilot's trend chart is the example.
- Recharts screens still to move: Analytics, Safety Statistics, Health,
  Occupational Hygiene (3), Security (2), Training, Risk (2).
- **Watermark.** The Suite brands every chart with `ChartLogo` inside
  `ChartFrame` (`/petrolord-chart-watermark.png`). HSE has no watermark
  asset; porting `ChartFrame` and `ChartLogo` waits for the owner's choice of
  mark (section 9), then lands in 4B.
- **Canvases.** HSE has no seismic or 3D views. The Leaflet maps (Report
  Wizard location picker, Sites) keep their tile imagery and controls;
  wrap each map frame in `data-canvas="light"` so the theme test skips the
  Leaflet internals and the controls read on the light tiles in both themes.
  No HSE screen needs a dark canvas.

## 7. End state (wave 4)

4A, once every list in `src/design/rollout/` covers every module:

- `SignedInScope` opens the scope always; the rollout folder goes.
- The ui kit and the shell drop their legacy branches (`tc(legacy, themed)`
  becomes the themed string), `useThemeClass` goes, and the legacy DOM pins
  retire.
- `index.css`: `:root` takes the light scope's values, `.dark` and the legacy
  palette variables go, and `GlobalThemeContext` stops setting `.dark` and
  the theme from `organization_branding.theme_mode` (owner decision 9.2).

4B: delete the unreachable files and unused ui files, port the chart
watermark, final walk of every screen in both themes.

## 8. Test strategy

The repo's runner stays vitest. Wave 0 adds `jsdom`, `@testing-library/react`
and `@testing-library/jest-dom` as dev dependencies; a test that needs a DOM
opts in with `// @vitest-environment jsdom` at the top, the rest keep the
node environment. Test JSX compiles with the automatic runtime, as the app
does.

### 8.1 The design tests (`src/design/__tests__`)

| test | proves |
|---|---|
| `tokens.test.js` | WCAG AA for every text role in both themes (also after HSL rounding), `theme.css` is the generated output of `tokens.js`, every rule is scoped under `[data-pl-theme]`, only HSL variables are re-pointed, Tailwind exposes every role |
| `suiteParity.test.js` | every token value equals the Suite snapshot in `suiteTokens.json` (Suite main `e7807a1da`); the only difference is the documented alias rename |
| `uiLegacyDom.test.jsx` | the kit outside a scope is byte for byte the capture from main `9614e76` |
| `shellLegacyDom.test.jsx` | the shell on an unmigrated module is byte for byte the capture from main (expanded, collapsed, chat open, notifications open, app switcher open) |
| `uiThemed.test.jsx` | the kit inside a scope: no legacy class, no stock shadcn colour token, every portal carries the theme, Suite input styling, toasts follow the scope |
| `signedInScope.test.jsx` | the rollout gate, the storage key, per-user separation, first paint while the session restores, the OS setting is ignored, the loader, the toggle's visibility, `useThemeClass` call shapes |

When the Suite changes a token, re-take the snapshot from Suite main and
re-port `tokens.js`; the parity test names what moved.

### 8.2 The module theme test

```jsx
// @vitest-environment jsdom
import { describeModuleTheme } from '@/design/testing/themeAssertions';
// vi.mock the contexts and data layer with src/design/testing/shellMocks.jsx
describeModuleTheme({
  name: 'Work Permits',
  moduleId: 'permits',
  renderApp: () => { resetShell({ activeModule: { id: 'permits' } }); return render(<Layout />); },
  ready: () => screen.findByText('Work Permits'),
});
```

It mounts the real `PetrolordHSE` layout on the module (so the shell is
checked too) and runs four checks: light by default in the scope; the header
toggle goes to dark and back and stores the choice under
`petrolord.theme.v1:<uid>`; no legacy class under any scope outside
`data-canvas` regions, with a planted negative control (a hex fill, white
text, a `dark:` variant and a legacy variable must all be found); and the
module is in the rollout. `src/components/hse/__tests__/HSEDashboard.theme.test.jsx`
is the example, with further states (tabs, the chat, menus, the chart tab,
a returning dark user) and a check that no import of the Supabase client
escapes the stub.

HSE's detector differs from the Suite's in two ways: `dark:` variants count
(HSE sets `.dark`), and the legacy palette variables and `petrolord-card`
count.

### 8.3 Shared pieces

A batch that makes a shared piece scope-aware captures its legacy DOM from
main first (extend `shellLegacyDom.test.jsx` or add a pin next to it), then
edits, then shows the pin still passes.

### 8.4 Looking at it

Staging needs a signed-in organisation, so each batch also checks its
screens in a private harness: a vite server on its own port with a private
cache in the session scratch folder, the real layout with the contexts and
services aliased to `shellMocks` (and a resolve hook so every import of the
Supabase client gets the stub; the harness makes no network call), `.dark`
set on `<html>` as the branding does. Light and dark at 1440 and 390, no
sideways scroll. The staging walk on hse.studio.petrolord.com stays with the
owner.

## 9. Decisions for the owner

1. **Ship wave 0 alone, or hold it.** After this merges, the next HSE upload
   shows the dashboard and AI Predictor in the family look (light by
   default) while the other 22 modules stay in the legacy console until their
   batches land; the switch between the two happens as the user changes
   module. To hold it, empty `src/design/rollout/w0.js` (one line) before the
   upload, or upload after wave 1.
2. **Organisation branding.** `GlobalThemeContext` applies
   `organization_branding.theme_mode` (dark by default), brand colours,
   fonts and custom CSS to `<html>`. Inside the scope the family roles win,
   so an organisation's colours stop showing on migrated screens, and
   `theme_mode` competes with the per-user toggle. Recommendation: in 4A
   keep the organisation logo and retire `theme_mode`, the colour and font
   overrides and custom CSS inside the app (one family look), or keep a
   single brand accent if the owner wants branding to show.
3. **Sharing the choice across apps.** The storage key is the Suite's
   (`petrolord.theme.v1:<uid>`), but HSE runs on its own origin
   (hse.petrolord.com; the Suite on www.petrolord.com; staging
   hse.studio and suite.studio), so browser storage is separate and a user
   chooses once per app. One choice across Suite, HSE and NextGen needs a
   server-side preference on the user profile, a shared table, so it needs a
   second engineer's review.
4. **Chart watermark.** Use the Suite's `/petrolord-chart-watermark.png` on
   HSE charts, or an HSE mark.
5. **Quick Report button colour.** In the family it is the gold `accent`
   button (the HSE signature action, ink text on gold) and no longer pulses.
   Confirm gold, or the petrol-green primary.

## 10. Wave 0 as built (this PR)

- `src/design/`: `tokens.js` and the generated `theme.css` (Suite values,
  HSE alias map), `themeCss.js` and `scripts/design/build-theme-css.mjs`,
  `ThemeProvider.jsx` (`ThemedApp`, `ThemeProvider`, `FixedTheme`, storage
  helpers), `themeContext.js`, `activeTheme.js`, `themeClass.js`,
  `SignedInScope.jsx` (`SignedInScope`, `InkRail`, `ThemedLoadingScreen`),
  `rollout/` (per-batch lists; `w0.js` = `dashboard`, `ai-analytics`),
  `testing/` (`themeAssertions.js`, `domShims.js`, `shellMocks.jsx`).
- `src/components/ui/`: `theme-toggle.jsx`, `chart-panel.jsx` (Suite ports)
  and the 28 adapted primitives. `src/utils/chartTheme.js`.
- Shell: `PetrolordHSE`, `MainContent`, `TopBar` (with the toggle),
  `LeftNav`, `AppSwitcher`, `NotificationCenter`, `ChatBot`, all
  scope-aware.
- Pilot: `HSEDashboard`, `LaunchChecklist`, `SafetyScore`, `BadgesDisplay`,
  `TeamLeaderboard`, `PredictiveInsightsDashboard`, `ForecastView` on roles.
- Tailwind `pl-*` roles, fonts, shadows and `rounded-pl-canvas`;
  `theme.css` imported after `index.css`.
- Known gap: the Quick Report and Report Wizard dialogs open in their legacy
  dark look over a migrated screen (their inputs already themed) until 1A.
