import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, FileText } from 'lucide-react';

export const PermitStatusBadge = ({ status }) => {
  const styles = {
    Draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Approved: "bg-green-500/10 text-green-400 border-green-500/20",
    Active: "bg-green-600 text-white border-none animate-pulse",
    Expired: "bg-red-500/10 text-red-400 border-red-500/20",
    Completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Cancelled: "bg-gray-700/50 text-gray-500 border-gray-700",
  };

  return (
    <Badge variant="outline" className={`${styles[status] || styles.Draft} capitalize`}>
      {status}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Low: "text-green-400",
    Medium: "text-yellow-400",
    High: "text-orange-400",
    Critical: "text-red-500 font-bold",
  };
  return <span className={styles[priority] || "text-gray-400"}>{priority}</span>;
};

export const RiskLevelIndicator = ({ level }) => {
  const config = {
    Low: { color: "bg-green-500", icon: CheckCircle },
    Medium: { color: "bg-yellow-500", icon: AlertTriangle },
    High: { color: "bg-orange-500", icon: ShieldAlert },
    Critical: { color: "bg-red-600", icon: ShieldAlert },
  };
  
  const { color, icon: Icon } = config[level] || config.Low;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-sm font-medium">{level} Risk</span>
    </div>
  );
};

export const PermitTypeIcon = ({ type }) => {
  // Simple mapping, could be extended
  return <FileText className="h-4 w-4 text-blue-400" />;
};