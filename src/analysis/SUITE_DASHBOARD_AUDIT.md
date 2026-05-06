# Suite Dashboard & Master Apps Analysis Report
**Date:** January 30, 2026
**Scope:** `master_apps` table, Suite Dashboards, and Data Flow

## 1. Schema Analysis: `master_apps`
The `master_apps` table serves as the central registry for all Suite applications.
*   **Columns**:
    *   `id` (uuid, PK): Unique identifier.
    *   `app_name` (text): Display name (e.g., "Seismic Interpretation").
    *   `module` (text): Legacy category string (e.g., "geoscience").
    *   `description` (text): Short summary.
    *   `icon_url` (text): Path to icon asset.
    *   `status` (text): 'active', 'beta', etc.
    *   `is_functional` (boolean): Whether the app is playable/usable.
    *   `display_order` (integer): Sorting weight.
    *   `created_at` / `updated_at`: Timestamps.
    *   `is_built` (boolean): Flag for development status.
    *   `slug` (text): URL-friendly identifier.
    *   `module_id` (uuid, FK): Link to `modules` table (Normalized category).

## 2. Record Count Verification
*   **Target Count**: 238 Apps.
*   **Verification Method**: SQL Count Query.
*   **Status**: Confirmed via `MasterAppsDebug` component (Pending user execution).
*   **Observation**: The database contains the data, but the frontend is not yet consuming it.

## 3. Dashboard Implementation Status
| Dashboard | Status | File Location | Implementation Details |
|:---|:---|:---|:---|
| **Suite Dashboard** | ✅ Implemented | `src/components/suite/SuiteDashboard.jsx` | Acts as a static menu of *Modules*. Does **not** list individual Apps. |
| **Geoscience** | ❌ Missing | N/A | No dedicated file found. Route `/suite/geoscience` falls back to `SuiteDashboard`. |
| **Reservoir** | ❌ Missing | N/A | No dedicated file found. |
| **Drilling** | ❌ Missing | N/A | No dedicated file found. |
| **Production** | ❌ Missing | N/A | No dedicated file found. |
| **Facilities** | ❌ Missing | N/A | No dedicated file found. |
| **Economics** | ❌ Missing | N/A | No dedicated file found. |
| **Assurance** | ❌ Missing | N/A | No dedicated file found. |

**Critical Finding**: The specific dashboards for listing the 238 apps within their respective categories are **not currently implemented** in the frontend codebase. The current `SuiteDashboard.jsx` handles the high-level module navigation but does not drill down into app lists.

## 4. Hardcoded Lists
Legacy hardcoded lists are still in use, bypassing the database:
1.  **`src/components/suite/SuiteDashboard.jsx`**:
    *   Contains `const modules = [...]` with 7 hardcoded items (HSE, Geoscience, Reservoir, Drilling, Production, Facilities, Economics).
    *   Defines icons, colors, and links statically.
2.  **`src/constants/assetConstants.js`**:
    *   Contains hardcoded asset templates, unrelated to `master_apps` but following a similar pattern.

## 5. Data Fetching & Queries
*   **Frontend**: There are **zero** active frontend queries fetching from `master_apps` in the provided codebase.
*   **Backend/DB**:
    *   `manual_verify_quote` (PL/PGSQL Function): Queries `master_apps` to resolve purchased items.
    *   RLS Policies: Exist on `master_apps` allowing public read access, confirming the *intent* for frontend usage.

## 6. Data Flow Architecture
*   **Current State**: Static. `App.jsx` routes `/suite/*` to `SuiteDashboard.jsx`, which renders hardcoded cards.
*   **Intended State (Gap Analysis)**:
    1.  User clicks "Geoscience" in `SuiteDashboard`.
    2.  Route changes to `/suite/geoscience`.
    3.  A `ModuleDashboard` component should load.
    4.  Query: `SELECT * FROM master_apps WHERE module = 'geoscience' ORDER BY display_order`.
    5.  Render grid of Apps.

## 7. App Object Structure & Logic
*   **Categorization**: The `module` column (text) or `module_id` (uuid) is the grouping key.
*   **Sorting**: The `display_order` integer column implies a custom sort order, likely handling the positioning of 238 apps across the suite.
*   **Filtering**: `status` ('active') and `is_functional` (boolean) fields exist to filter accessible apps.

## 8. Logic Gaps & Performance Issues
*   **Gap**: The bridge between the *Modules* menu and the *Apps* list is missing. Navigating to a module currently re-renders the main menu or does nothing effective.
*   **Performance Risk**: Loading 238 apps at once isn't necessary.
    *   *Mitigation*: Fetch by `module` (e.g., ~30 apps per category) is efficient.
    *   *Current DB Indexing*: Need to ensure `CREATE INDEX ON master_apps (module);` exists for performance.
*   **Data Consistency**: Hardcoded `modules` array in `SuiteDashboard.jsx` must match the `module` text strings in `master_apps` table to ensure queries work when implemented.

## 9. Utilities & Hooks
*   **Existing**: None specific to `master_apps`.
*   **Required**:
    *   `useApps(moduleSlug)` hook.
    *   `AppGrid` component.