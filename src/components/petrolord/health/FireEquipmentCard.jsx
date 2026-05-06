import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Flame as FireExtinguisher, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FireEquipmentCard({ equipment }) {
  const isOperational = equipment.status === 'Operational';
  return (
    <div className="p-4 bg-[#252541] rounded-lg border border-[#3a3a5a] flex items-start justify-between hover:bg-[#2d2d4a] transition-colors">
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${isOperational ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          <FireExtinguisher className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-white font-medium text-sm">{equipment.equipment_type}</h4>
          <p className="text-xs text-gray-400">{equipment.location}</p>
          <p className="text-[10px] text-gray-500 mt-1">SN: {equipment.serial_number || 'N/A'}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={isOperational ? 'default' : 'destructive'} className="text-[10px]">
          {equipment.status}
        </Badge>
        <span className="text-[10px] text-gray-500">Next: {new Date(equipment.next_inspection_date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}