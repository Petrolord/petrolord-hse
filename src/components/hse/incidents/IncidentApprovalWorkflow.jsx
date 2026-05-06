import React from 'react';
import { CheckCircle, XCircle, ShieldQuestion, Clock, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function IncidentApprovalWorkflow({ status, onAction }) {
  
  const steps = [
    { id: 'open', label: 'Incident Reported', status: 'completed' },
    { id: 'investigation', label: 'Investigation', status: status === 'open' ? 'pending' : status === 'investigation' ? 'current' : 'completed' },
    { id: 'review', label: 'Safety Review', status: status === 'review' ? 'current' : status === 'closed' ? 'completed' : 'pending' },
    { id: 'closed', label: 'Closed', status: status === 'closed' ? 'completed' : 'pending' },
  ];

  return (
    <div className="bg-[#252541]/50 p-4 rounded-lg border border-[#3a3a5a] space-y-4">
      <h4 className="text-sm font-bold text-[#e0e0e0] border-b border-[#3a3a5a] pb-2 flex items-center gap-2">
        <ShieldQuestion className="h-4 w-4 text-[#FFC107]" /> Investigation Workflow
      </h4>
      
      <div className="relative pl-4 space-y-6 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#3a3a5a]">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex items-center gap-4">
            <div className={`absolute left-0 z-10 w-3 h-3 rounded-full border-2 ${
              step.status === 'completed' ? 'bg-green-500 border-green-500' :
              step.status === 'current' ? 'bg-[#FFC107] border-[#FFC107] animate-pulse' :
              'bg-[#1a1a2e] border-[#7a7a9a]'
            }`} />
            <div className={`ml-6 ${step.status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
              <p className="text-sm font-medium text-white">{step.label}</p>
              {step.status === 'completed' && <span className="text-[10px] text-green-400">Completed</span>}
              {step.status === 'current' && <span className="text-[10px] text-[#FFC107]">In Progress</span>}
            </div>
          </div>
        ))}
      </div>

      {status === 'investigation' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#3a3a5a]">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => onAction('approve_investigation')}>
            <CheckCircle className="mr-2 h-4 w-4" /> Approve Findings
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={() => onAction('reject_investigation')}>
            <XCircle className="mr-2 h-4 w-4" /> Reject
          </Button>
        </div>
      )}
    </div>
  );
}