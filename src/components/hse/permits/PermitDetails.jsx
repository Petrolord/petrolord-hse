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
      <SheetContent className="w-full sm:max-w-xl p-0">
        <SheetHeader className="p-4 sm:p-6 bg-pl-surface border-b border-pl-border text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pr-8">
            <Badge variant="neutral" className="font-pl-mono">{permit.permit_number}</Badge>
            <PermitStatusBadge status={permit.status} />
          </div>
          <SheetTitle className="text-xl text-pl-text">{permit.title}</SheetTitle>
          <SheetDescription>
            {permit.description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Key Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-pl-muted">Location</span>
                <div className="flex items-center gap-2 text-sm text-pl-text">
                  <MapPin className="h-4 w-4 text-pl-muted" aria-hidden="true" />
                  {permit.location}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-pl-muted">Department</span>
                <div className="text-sm text-pl-text">{permit.department}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-pl-muted">Requester</span>
                <div className="flex items-center gap-2 text-sm text-pl-text">
                  <User className="h-4 w-4 text-pl-muted" aria-hidden="true" />
                  {permit.requester?.raw_user_meta_data?.full_name || 'Unknown'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-pl-muted">Supervisor</span>
                <div className="text-sm text-pl-text">{permit.supervisor?.raw_user_meta_data?.full_name || 'Unassigned'}</div>
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-pl-text">
                <Calendar className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-pl-surface p-3 rounded-lg border border-pl-border">
                <div>
                  <span className="text-xs text-pl-muted">Start</span>
                  <p className="text-sm text-pl-text font-pl-mono tabular-nums">{permit.start_date ? new Date(permit.start_date).toLocaleString() : 'n/a'}</p>
                </div>
                <div>
                  <span className="text-xs text-pl-muted">End</span>
                  <p className="text-sm text-pl-text font-pl-mono tabular-nums">{permit.end_date ? new Date(permit.end_date).toLocaleString() : 'n/a'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hazards & Risks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2 text-pl-text">
                  <AlertTriangle className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Hazards & Risks
                </h4>
                <RiskLevelIndicator level={permit.risk_level} />
              </div>
              
              <div className="bg-pl-surface p-4 rounded-lg border border-pl-border space-y-4">
                <div>
                  <span className="text-xs text-pl-muted block mb-2">Identified Hazards</span>
                  <div className="flex flex-wrap gap-2">
                    {permit.hazards?.map((h, i) => (
                      <Badge key={i} variant="neutral">{h}</Badge>
                    ))}
                    {!permit.hazards?.length && <span className="text-sm text-pl-muted">None identified</span>}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-pl-muted block mb-2">Required PPE</span>
                  <div className="flex flex-wrap gap-2">
                    {permit.ppe_requirements?.map((p, i) => (
                      <Badge key={i} variant="neutral">{p}</Badge>
                    ))}
                    {!permit.ppe_requirements?.length && <span className="text-sm text-pl-muted">None specified</span>}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-pl-text">
                <Shield className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Emergency Procedures
              </h4>
              <p className="text-sm text-pl-text bg-pl-surface p-3 rounded-lg border border-pl-border">
                {permit.emergency_procedures || "No specific procedures documented."}
              </p>
            </div>

          </div>
        </ScrollArea>

        <div className="p-4 bg-pl-surface border-t border-pl-border">
          <Button className="w-full">
            Download PDF Report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}