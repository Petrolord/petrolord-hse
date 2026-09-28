import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { accountRow } from '@/components/account/accountChrome';

const workflows = [
  {
    id: "incident-reporting",
    title: "Reporting a Hazard or Incident (Quick Report)",
    steps: [
      "Open Quick Report from the app.",
      "Capture a photo of the hazard and/or record a short voice note.",
      "Let the AI analyse it. It suggests a category, severity, description and recommended actions.",
      "Review and edit the suggested details (title, description, category, severity, location).",
      "Submit. You receive a reference ID and the report is routed for review.",
      "Track progress under My Reports; supervisors action it from the Supervisor View."
    ]
  },
  {
    id: "risk-assessment",
    title: "Conducting a Risk Assessment",
    steps: [
      "Go to the Risk Assessment tab in Risk Management.",
      "Select 'New Assessment' or update an existing one.",
      "Identify hazards associated with the activity.",
      "Rate Likelihood (1-5) and Consequence (1-5) to get initial Risk Score.",
      "Define control measures to reduce risk.",
      "Rate Residual Risk after controls are applied.",
      "Submit for approval if Risk Score is High or Critical."
    ]
  },
  {
    id: "corrective-action",
    title: "Corrective Action Management",
    steps: [
      "Access the Action Tracker module.",
      "Create a new action or open one assigned to you.",
      "Review the source (Audit, Incident, Inspection).",
      "Implement the required change or fix.",
      "Upload evidence of completion (Photo, Document).",
      "Mark status as 'Completed' to notify the verifier."
    ]
  }
];

// Design family (batch 2C): theme roles; the approval levels use the status
// badges with their words.
export default function FeaturesWorkflows() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-4">Common Workflows</h2>
        <p className="text-pl-muted">Step-by-step instructions for the most frequent tasks in Petrolord HSE.</p>
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-4 sm:p-6">
            <h3 className="text-xl font-semibold text-pl-text mb-6 flex items-center">
              {wf.title}
            </h3>
            <div className="relative ml-2 pl-4 border-l-2 border-pl-border space-y-8">
              {wf.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[27px] top-0 h-5 w-5 rounded-full bg-pl-primary text-pl-primary-fg text-xs font-bold font-pl-mono tabular-nums flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-pl-text">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-pl-text mb-6">Approval Processes</h3>
        <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-4 sm:p-6">
          <p className="text-pl-muted mb-4">
            Approvals are automated based on risk levels and user roles. Here is the general hierarchy:
          </p>
          <div className="grid gap-4">
            <div className={cn(accountRow, 'flex-col items-start sm:flex-row sm:items-center p-4 rounded-lg')}>
              <div>
                <span className="text-pl-text font-bold">Low Risk Items</span>
                <p className="text-xs text-pl-muted">Routine inspections, minor observations</p>
              </div>
              <Badge variant="success" className="shrink-0">Auto-Approved / Supervisor</Badge>
            </div>
            <div className={cn(accountRow, 'flex-col items-start sm:flex-row sm:items-center p-4 rounded-lg')}>
              <div>
                <span className="text-pl-text font-bold">Medium Risk Items</span>
                <p className="text-xs text-pl-muted">Lost time injuries, significant spills</p>
              </div>
              <Badge variant="warning" className="shrink-0">Manager Approval</Badge>
            </div>
            <div className={cn(accountRow, 'flex-col items-start sm:flex-row sm:items-center p-4 rounded-lg')}>
              <div>
                <span className="text-pl-text font-bold">High/Critical Risk Items</span>
                <p className="text-xs text-pl-muted">Major incidents, high-value procurement</p>
              </div>
              <Badge variant="danger" className="shrink-0">Executive / Board Approval</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}