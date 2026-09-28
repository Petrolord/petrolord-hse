import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Flame as FireExtinguisher } from 'lucide-react';

// Design family (batch 2B): the status word sits in a status Badge; the icon
// tile is neutral.
export default function FireEquipmentCard({ equipment }) {
  const isOperational = equipment.status === 'Operational';
  return (
    <div className="p-4 bg-pl-sunken rounded-lg border border-pl-border flex items-start justify-between gap-3 hover:bg-pl-border/60 transition-colors">
      <div className="flex gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-pl-surface text-pl-muted">
          <FireExtinguisher className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h4 className="text-pl-text font-medium text-sm">{equipment.equipment_type}</h4>
          <p className="text-xs text-pl-muted">{equipment.location}</p>
          <p className="text-[10px] text-pl-muted mt-1">SN: <span className="font-pl-mono">{equipment.serial_number || 'n/a'}</span></p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Badge variant={isOperational ? 'success' : 'danger'} className="text-[10px]">
          {equipment.status}
        </Badge>
        <span className="text-[10px] text-pl-muted">Next: <span className="font-pl-mono tabular-nums">{new Date(equipment.next_inspection_date).toLocaleDateString()}</span></span>
      </div>
    </div>
  );
}
