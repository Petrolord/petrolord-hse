import React from 'react';
import { CheckCircle, XCircle, ShieldQuestion, Clock } from 'lucide-react';

const statusMap = {
  open: { icon: <Clock className="h-5 w-5 text-pl-muted" aria-hidden="true" />, text: "Action is Open" },
  in_progress: { icon: <Clock className="h-5 w-5 text-pl-info-text" aria-hidden="true" />, text: "Work in Progress" },
  pending_approval: { icon: <ShieldQuestion className="h-5 w-5 text-pl-warning-text" aria-hidden="true" />, text: "Pending Approval" },
  closed: { icon: <CheckCircle className="h-5 w-5 text-pl-success-text" aria-hidden="true" />, text: "Approved and Closed" },
  rejected: { icon: <XCircle className="h-5 w-5 text-pl-danger-text" aria-hidden="true" />, text: "Rejected, Awaiting Rework" },
};

export default function ActionApprovalWorkflow({ action }) {
  const history = action.status_history || [];
  const approver = action.approver;

  const relevantHistory = history.filter(h => ['pending_approval', 'closed', 'open'].includes(h.status));

  return (
    <div className="bg-pl-surface p-4 rounded-lg border border-pl-border space-y-4">
      <h4 className="text-sm font-semibold text-pl-text border-b border-pl-border pb-2">Approval Workflow</h4>
      <div className="space-y-4">
        {history.map((item, index) => {
           const statusInfo = statusMap[item.status] || { icon: <Clock className="h-5 w-5 text-pl-muted" aria-hidden="true" />, text: item.status };
           return (
             <div key={index} className="flex items-start gap-4">
               <div>{statusInfo.icon}</div>
               <div className="flex-1">
                 <p className="font-medium text-pl-text text-sm">{statusInfo.text}</p>
                 <p className="text-xs text-pl-muted font-pl-mono tabular-nums">{new Date(item.changed_at).toLocaleString()}</p>
               </div>
             </div>
           );
        })}
        {action.status === 'closed' && approver && (
          <div className="flex items-start gap-4 p-3 bg-pl-success-bg rounded-md border border-pl-success/40">
            <CheckCircle className="h-5 w-5 text-pl-success-text" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-pl-text text-sm">Approved by {approver.raw_user_meta_data?.full_name}</p>
              <p className="text-xs text-pl-muted mt-1 italic">"{action.closure_comment || 'Action completed.'}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}