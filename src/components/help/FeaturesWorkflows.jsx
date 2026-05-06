import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from 'lucide-react';

const workflows = [
  {
    id: "incident-reporting",
    title: "Incident Reporting Workflow",
    steps: [
      "Navigate to Health or Safety Module dashboard.",
      "Click 'Report Incident' in the top action bar.",
      "Fill in the initial notification form (Date, Time, Location, Type).",
      "Add immediate actions taken to secure the scene.",
      "Attach photos or witness statements.",
      "Submit for review. The Incident Manager will be notified automatically."
    ]
  },
  {
    id: "risk-assessment",
    title: "Conducting a Risk Assessment",
    steps: [
      "Go to Risk Management > Risk Assessment tab.",
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

export default function FeaturesWorkflows() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Common Workflows</h2>
        <p className="text-[#b0b0c0]">Step-by-step instructions for the most frequent tasks in Petrolord HSE.</p>
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              {wf.title}
            </h3>
            <div className="relative pl-4 border-l-2 border-[#3a3a5a] space-y-8">
              {wf.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-[#FFC107] text-black text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Approval Processes</h3>
        <div className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-6">
          <p className="text-gray-400 mb-4">
            Approvals are automated based on risk levels and user roles. Here is the general hierarchy:
          </p>
          <div className="grid gap-4">
            <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-lg">
              <div>
                <span className="text-white font-bold">Low Risk Items</span>
                <p className="text-xs text-gray-500">Routine inspections, minor observations</p>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-500">Auto-Approved / Supervisor</Badge>
            </div>
            <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-lg">
              <div>
                <span className="text-white font-bold">Medium Risk Items</span>
                <p className="text-xs text-gray-500">Lost time injuries, significant spills</p>
              </div>
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">Manager Approval</Badge>
            </div>
            <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-lg">
              <div>
                <span className="text-white font-bold">High/Critical Risk Items</span>
                <p className="text-xs text-gray-500">Major incidents, high-value procurement</p>
              </div>
              <Badge variant="outline" className="border-red-500 text-red-500">Executive / Board Approval</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}