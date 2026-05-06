import React from 'react';
import { CheckCircle, XCircle, ShieldQuestion, Clock } from 'lucide-react';

const statusMap = {
  open: { icon: <Clock className="h-5 w-5 text-blue-400" />, text: "Action is Open" },
  in_progress: { icon: <Clock className="h-5 w-5 text-yellow-400" />, text: "Work in Progress" },
  pending_approval: { icon: <ShieldQuestion className="h-5 w-5 text-purple-400" />, text: "Pending Approval" },
  closed: { icon: <CheckCircle className="h-5 w-5 text-green-400" />, text: "Approved and Closed" },
  rejected: { icon: <XCircle className="h-5 w-5 text-red-400" />, text: "Rejected, Awaiting Rework" },
};

export default function ActionApprovalWorkflow({ action }) {
  const history = action.status_history || [];
  const approver = action.approver;

  const relevantHistory = history.filter(h => ['pending_approval', 'closed', 'open'].includes(h.status));

  return (
    <div className="bg-[#252541]/50 p-4 rounded-lg border border-[#3a3a5a] space-y-4">
      <h4 className="text-sm font-bold text-[#e0e0e0] border-b border-[#3a3a5a] pb-2">Approval Workflow</h4>
      <div className="space-y-4">
        {history.map((item, index) => {
           const statusInfo = statusMap[item.status] || { icon: <Clock className="h-5 w-5 text-gray-500" />, text: item.status };
           return (
             <div key={index} className="flex items-start gap-4">
               <div>{statusInfo.icon}</div>
               <div className="flex-1">
                 <p className="font-medium text-white text-sm">{statusInfo.text}</p>
                 <p className="text-xs text-[#7a7a9a]">{new Date(item.changed_at).toLocaleString()}</p>
               </div>
             </div>
           );
        })}
        {action.status === 'closed' && approver && (
          <div className="flex items-start gap-4 p-3 bg-[#1a1a2e] rounded-md border border-green-500/50">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Approved by {approver.raw_user_meta_data?.full_name}</p>
              <p className="text-xs text-[#7a7a9a] mt-1 italic">"{action.closure_comment || 'Action completed.'}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}