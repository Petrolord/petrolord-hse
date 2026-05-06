# Petrolord HSE Development Plan
**Phase 1: Closing the Gap**

This plan outlines the steps to bridge the gap between current implementation and the homepage promises.

## Sprint 1: The "Real-Time" & Mobile Promise
*Goal: Make the app feel faster and work better on phones.*

- [ ] **PWA Implementation:**
    - Add `manifest.json`.
    - Configure Vite PWA plugin.
    - Enable "Add to Home Screen".
- [ ] **Live Data:**
    - Update `IncidentsList.jsx` to use `supabase.channel` for realtime table subscriptions.
    - Ensure dashboard counters increment instantly when a new incident enters the DB.
- [ ] **Mobile UI Polish:**
    - Increase touch target sizes for buttons in `ReportWizard.jsx`.
    - Ensure file uploaders allow direct camera access on mobile (`capture="environment"`).

## Sprint 2: Automation & Compliance
*Goal: Deliver on "Automated" promises.*

- [ ] **Notification Engine:**
    - Create a Supabase Edge Function `handle-new-incident`.
    - Use Resend API to email Safety Managers when High Severity incidents are logged.
- [ ] **Compliance Triggers:**
    - Create a DB Trigger: When `work_permit` is created, check `compliance_rules` for the site.
    - If a rule is violated (e.g., "No Hot Work on weekends"), auto-flag the permit.

## Sprint 3: Analytics & Trust
*Goal: Make the data visualization powerful.*

- [ ] **Export Functionality:**
    - Implement `jsPDF` or `csv-downloader` on the `IncidentsList` to allow "Export to PDF/Excel".
- [ ] **Trend Analysis:**
    - Build a simple linear regression helper in `utils.js` to show "Trend Lines" on charts (fulfilling the "Predictive" promise minimally).

## Sprint 4: Customizable Workflows (Long Term)
*Goal: Allow users to define their own processes.*

- [ ] **Workflow Table:**
    - Create `workflow_definitions` table in DB.
- [ ] **Dynamic Wizard:**
    - Refactor `ReportWizard.jsx` to render steps based on JSON configuration from the DB, rather than hardcoded React steps.

---

## Technical Debt to Address
1.  **Refactor `ReportWizard.jsx`:** It is currently 778 lines. Split into `IncidentTypeStep.jsx`, `DetailsStep.jsx`, `EvidenceStep.jsx`.
2.  **Unified Context:** Ensure `HSEContext` is effectively caching data to reduce DB hits.