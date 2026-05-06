# Fire Safety & Spill Management Module Audit Report
**Date:** 2026-01-01
**Auditor:** Petrolord Horizons System

## 1. Executive Summary
This report analyzes the current state of the Fire Safety and Spill Management modules within the Petrolord HSE ecosystem. The audit identifies significant functionality overlaps, data silos between specialized modules and the core Incident Management system, and missing database infrastructure for Fire Safety.

## 2. Fire Safety Module Analysis

### 2.1 Current Structure
*   **Main Container:** `src/components/hse/fire/FireSafetyModule.jsx`
*   **Sub-components:**
    *   `FireFilters.jsx`: Provides filtering by record type (Inspection, Hazard, Incident, Training).
    *   `NewFireSafetyRecordModal.jsx`: Form for creating new records.
*   **Features:**
    *   Record Registry (List view with filtering).
    *   Placeholder tabs for "Drills" and "Equipment".
    *   Record Types: `Fire Inspection`, `Fire Hazard`, `Fire Incident`, `Fire Training`.

### 2.2 Database & Data Health
*   **Status:** 🔴 **CRITICAL GAP**
*   **Finding:** The codebase references a `fireService` that attempts to create records with IDs like `FIRE-xxxx`. However, a dedicated `fire_safety_records` table **does not exist** in the current database schema.
*   **Implication:** Creation of fire records will fail unless `fireService` is internally re-routing to a generic table (like `custom_fields` or `incidents`), which is not evident from the schema.

### 2.3 Integration & Overlaps
*   **HSE Incidents:** The module allows creation of "Fire Incidents". If these are stored separately (or fail to store), they will not appear in the main `HSE Dashboard` statistics or `IncidentsModule`.
*   **Risk Management:** "Fire Hazard" records effectively duplicate functionality found in the `RiskManagementModule` (Hazard Registry).

---

## 3. Spill Management Module Analysis

### 3.1 Current Structure
*   **Main Container:** `src/components/hse/spill/SpillManagementModule.jsx`
*   **Sub-components:**
    *   `NewSpillModal.jsx`: dedicated form for chemical/fluid spills.
*   **Features:**
    *   Spill Registry (Table view).
    *   Reporting (Substance, Quantity, Unit, Severity, Location).
    *   Placeholder tabs for "Response" and "Dashboard".

### 3.2 Database & Data Health
*   **Status:** 🟢 **HEALTHY**
*   **Table:** `environment_spill_reports`
*   **Schema:** `id`, `spill_id`, `substance`, `quantity_spilled`, `severity`, `status`, `coordinates`, etc.
*   **Data Integrity:** The table is well-structured and specifically designed for environmental incidents.

### 3.3 Integration & Overlaps
*   **Environment Module (Petrolord):** 
    *   **Major Overlap:** The `src/components/petrolord/EnvironmentModule.jsx` contains a "Spills & Remediation" tab (`SpillsRemediation.jsx`).
    *   **Analysis:** Both modules read/write to the **same** database table (`environment_spill_reports`). This creates dual entry points for the same data, which can be confusing for users (e.g., "Do I go to 'Environment' or 'Spills' to report a leak?").
*   **HSE Incidents:** Spills are effectively environmental incidents. Currently, the `incidents` table (General HSE) and `environment_spill_reports` are separate. A high-severity spill might be tracked in the Spill module but fail to trigger high-severity workflows (e.g., notifications, investigations) defined in the main Incident module.

---

## 4. Data Relationship Diagram (Conceptual)