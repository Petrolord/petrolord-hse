import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, FileText } from 'lucide-react';

// Design family (batch 1B): Work Permits renders inside the signed-in scope,
// so status takes the Badge status variants, always with the word inside.
// Active is a solid success badge (it no longer pulses).
export const PermitStatusBadge = ({ status }) => {
  const variants = {
    Draft: "neutral",
    Submitted: "info",
    Approved: "success",
    Active: "success",
    Expired: "danger",
    Completed: "neutral",
    Cancelled: "neutral",
  };

  return (
    <Badge variant={variants[status] || variants.Draft} className={`capitalize whitespace-nowrap ${status === 'Active' ? 'bg-pl-success text-pl-success-fg' : ''}`}>
      {status}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Low: "text-pl-success-text",
    Medium: "text-pl-warning-text",
    High: "text-pl-danger-text",
    Critical: "text-pl-danger-text font-bold",
  };
  return <span className={styles[priority] || "text-pl-muted"}>{priority}</span>;
};

export const RiskLevelIndicator = ({ level }) => {
  const config = {
    Low: { color: "bg-pl-success", icon: CheckCircle },
    Medium: { color: "bg-pl-warning", icon: AlertTriangle },
    High: { color: "bg-pl-danger", icon: ShieldAlert },
    Critical: { color: "bg-pl-danger", icon: ShieldAlert },
  };
  
  const { color, icon: Icon } = config[level] || config.Low;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-sm font-medium text-pl-text">{level} Risk</span>
    </div>
  );
};

export const PermitTypeIcon = ({ type }) => {
  // Simple mapping, could be extended
  return <FileText className="h-4 w-4 text-pl-muted" aria-hidden="true" />;
};