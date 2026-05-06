import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PermitStatusBadge, RiskLevelIndicator } from './PermitComponents';
import { Calendar, MapPin, User, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function PermitDetails({ permit, isOpen, onClose }) {
  if (!permit) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-[var(--bg-app)] border-l border-[var(--border-color)] p-0 text-white">
        <SheetHeader className="p-6 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="font-mono">{permit.permit_number}</Badge>
            <PermitStatusBadge status={permit.status} />
          </div>
          <SheetTitle className="text-xl text-white">{permit.title}</SheetTitle>
          <SheetDescription className="text-gray-400">
            {permit.description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Key Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Location</span>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {permit.location}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Department</span>
                <div className="text-sm">{permit.department}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Requester</span>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-purple-400" />
                  {permit.requester?.raw_user_meta_data?.full_name || 'Unknown'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Supervisor</span>
                <div className="text-sm">{permit.supervisor?.raw_user_meta_data?.full_name || 'Unassigned'}</div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Schedule */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-blue-400">
                <Calendar className="h-4 w-4" /> Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-[var(--bg-card)] p-3 rounded-lg border border-gray-800">
                <div>
                  <span className="text-xs text-gray-500">Start</span>
                  <p className="text-sm">{permit.start_date ? new Date(permit.start_date).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End</span>
                  <p className="text-sm">{permit.end_date ? new Date(permit.end_date).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Hazards & Risks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" /> Hazards & Risks
                </h4>
                <RiskLevelIndicator level={permit.risk_level} />
              </div>
              
              <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-gray-800 space-y-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-2">Identified Hazards</span>
                  <div className="flex flex-wrap gap-2">
                    {permit.hazards?.map((h, i) => (
                      <Badge key={i} variant="secondary" className="bg-red-900/30 text-red-300 hover:bg-red-900/40">{h}</Badge>
                    ))}
                    {!permit.hazards?.length && <span className="text-sm text-gray-500">None identified</span>}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500 block mb-2">Required PPE</span>
                  <div className="flex flex-wrap gap-2">
                    {permit.ppe_requirements?.map((p, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-900/30 text-blue-300 hover:bg-blue-900/40">{p}</Badge>
                    ))}
                    {!permit.ppe_requirements?.length && <span className="text-sm text-gray-500">None specified</span>}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Emergency */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-green-400">
                <Shield className="h-4 w-4" /> Emergency Procedures
              </h4>
              <p className="text-sm text-gray-300 bg-[var(--bg-card)] p-3 rounded-lg border border-gray-800">
                {permit.emergency_procedures || "No specific procedures documented."}
              </p>
            </div>

          </div>
        </ScrollArea>

        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Download PDF Report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}