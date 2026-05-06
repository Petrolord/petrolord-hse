# Petrolord Architectural Analysis Report
**Date:** January 30, 2026
**Scope:** Schema, Authentication, Isolation, and Cross-App Dependencies (HSE vs. Suite)

## 1. Database Schema Architecture

The database is primarily hosted in the `public` schema but exhibits a clear logical separation between **Core/Shared Entities**, **HSE Domain**, and **Suite Domain**.

### A. Shared Core (Multi-Tenant Foundation)
These tables act as the backbone for both applications, handling identity and tenancy.
*   **`organizations`**: The central tenant entity. Key columns: `hse_enabled`, `app_type` ('hse', 'suite'), `modules` (array defining access), `subscription_tier`.
*   **`users`**: Extends Supabase Auth. Stores `primary_app` (routing preference), `subscribed_modules`.
*   **`organization_users`**: The linkage table defining RBAC. Stores `role` (e.g., 'admin', 'owner') and `user_role` (often synonymous).
*   **`invitations`**: Generic invitation system for onboarding users to Organizations.
*   **`notifications` / `user_notifications`**: Centralized notification feed.

### B. Petrolord HSE Domain (Org-Centric)
Tables in this domain follow a strict **Organization-Based Multi-Tenancy** model. Data is owned by the Organization, not the User.
*   **Key Tables**: `incidents`, `observations` (implied via reports), `work_permits`, `risks`, `safety_audits`, `actions`, `contractors`, `environment_*` (various tables).
*   **Access Pattern**: RLS policies almost exclusively check `organization_id`.
    *   *Example:* `incidents` RLS: `organization_id IN (SELECT organization_users.organization_id WHERE user_id = auth.uid())`.

### C. Petrolord Suite Domain (User/Project-Centric)
Tables here follow a **User-Ownership** or **Explicit Team** model, reflecting the engineering nature of the tools (Petrophysics, Economics, etc.).
*   **Key Tables**: 
    *   **Economics**: `econ_projects`, `econ_models`, `econ_scenarios`.
    *   **MEM**: `mem_projects`, `mem_wells`, `mem_team_access`.
    *   **Seismic**: `ss_projects`, `ss_volumes`.
    *   **Petrophysics**: `petrophysics_projects`, `petrophysics_wells`.
*   **Access Pattern**: RLS policies typically check creator ownership first, then explicit sharing.
    *   *Example:* `mem_projects` RLS: `auth.uid() = user_id`.
    *   *Sharing:* Achieved via specific access tables (e.g., `mem_team_access`, `petrophysics_team_members`) rather than implicit Org-wide access.

---

## 2. Authentication & User Model

### Shared Authentication
*   **Single Project:** Both apps share the same Supabase Auth instance (`auth.users`).
*   **Unified Identity:** A user has one login (Email/Password) for the entire platform.
*   **Context Switching:** The `users` table's `last_accessed_app` and `primary_app` columns are likely used by the frontend to determine whether to route to `/dashboard` (HSE) or `/suite` (Engineering Apps) upon login.

### Authorization & Role Management
*   **Organization Level:** Managed via `organization_users`.
    *   **Roles:** 'owner', 'admin', 'member', 'supervisor' (HSE specific).
*   **Module Access:** Controlled via the `modules` array in `organization_users`.
    *   *HSE Access:* Checks for 'HSE', 'HSE Premium'.
    *   *Suite Access:* Checks for specific modules like 'Economics', 'Petrophysics'.
    *   *Logic:* A user can be an Admin in Org A (HSE) but have no access to Suite modules, or vice versa.

---

## 3. Edge Functions Strategy

The Edge Functions are deployed in a shared namespace but can be classified by functional scope.

| Function Name | Scope | Responsibility | Access/Isolation |
|:---|:---|:---|:---|
| `invite-user` | **Shared** | Sends email invites to join an Org. | Checks `organization_id` payload. |
| `send-email` | **Shared** | Generic SMTP wrapper (likely Brevo/Resend). | Secured via Supabase Secrets. |
| `admin-create-user`| **Shared** | Admin utility for user provisioning. | Service Role access only. |
| `send-confirmation`| **Shared** | Auth lifecycle emails. | Service Role access. |
| `analyze-image` | **Shared/AI** | Vision API wrapper (HSE reporting, maybe Suite logs). | Generic input/output. |
| `transcribe-audio`| **Shared/AI** | Speech-to-text (HSE reporting, Suite notes). | Generic. |
| `chat-with-petrolord`| **Shared/AI**| AI Assistant backend. | Context-aware based on prompt. |
| `analyze-quick-report`| **App-Specific**| HSE specific analysis of incident reports. | Bound to HSE logic. |

**Observation:** The strategy relies on **Shared Utilities**. There is little distinct "HSE Function" vs "Suite Function" separation physically; logic is separated by the caller's payload.

---

## 4. Realtime Infrastructure

*   **Shared Channels:** The codebase uses standard Supabase Realtime (Postgres Changes).
*   **HSE Usage:**
    *   `incidents`: Updates on status changes (New -> Investigating).
    *   `actions`: Updates on action closure.
*   **Suite Usage:**
    *   Likely used for long-running job notifications (e.g., `ss_jobs`, `mem_batch_jobs`) or collaborative editing in `mem_team_access` contexts.
*   **Risk:** Realtime broadcasts are filtered by RLS. Since RLS is robust, data leakage via sockets is minimal, provided the client subscribes with correct filters (e.g., `filter: 'organization_id=eq.123'`).

---

## 5. Data Isolation & Security Assessment

### Mechanisms
1.  **Row Level Security (RLS):** This is the primary firewall.
    *   **HSE:** Robust Org-based isolation. Users cannot see data from Orgs they don't belong to.
    *   **Suite:** Owner-based isolation. Users see their own projects. Sharing is explicit.
2.  **App Markers:** `app_type` on Organizations helps frontend filter context, but backend enforcement is purely RLS.

### Potential Leakage Points (Cross-App Dependencies)
*   **The `projects` Table:** There is a generic `public.projects` table alongside app-specific ones (`econ_projects`, etc.).
    *   *Risk:* If HSE uses `public.projects` for "Site Projects" and Suite uses it for "Generic Engineering Projects", schema conflicts (columns like `baseline_budget`) could arise.
*   **User Profiles:** A single `user_profiles` table serves both.
    *   *Impact:* Job titles/Departments are shared. If a user is a "Drilling Engineer" in Suite context but a "Safety Observer" in HSE context, the single profile might be limiting.

---

## 6. Architectural Divergences & Conflicts

### 1. The "Team" Concept Conflict
*   **HSE:** "Team" = `organization_users` (Implicit). Everyone in the Org is potentially visible.
*   **Suite:** "Team" = Explicit tables (`mem_team_access`). You must manually add users to a specific project.
*   **Friction:** An HSE Admin expects to see *everything*. A Suite user expects to see *only their assigned projects*. This difference in visibility models could confuse users switching between apps.

### 2. Legacy/Ghost Schema (`petrolord`)
*   Some FK references (e.g., in `geomech_velocity`) point to `petrolord.wells`, though `public.wells` exists.
*   *Verdict:* This suggests a migration in progress or legacy artifact. New development should strictly use `public`.

### 3. Naming Ambiguity
*   `assets` vs `organization_assets` vs `ss_assets`.
    *   `organization_assets`: Likely physical equipment (HSE).
    *   `ss_assets`: Digital seismic files (Suite).
    *   *Conflict:* A generic "Asset Manager" UI could easily mix these up if not strictly typed.

---

## 7. Entity Map (Conceptual)