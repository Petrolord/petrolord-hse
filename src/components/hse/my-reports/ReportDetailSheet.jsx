import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { MapPin, User, FileText, CheckCircle2, Play, AlertTriangle, Archive, UserPlus, CheckSquare } from 'lucide-react';
import { STATUS_BADGE, SEVERITY_TEXT } from './MyReportsList';

// On the design-system roles: My Reports renders inside the scope (batch 1A).
// The sheet's other importer, hse/supervisor/SupervisorReportList, is not
// reachable from any route (docs/scope/DesignSystem-Rollout.md section 1).

export default function ReportDetailSheet({ report, isOpen, onClose }) {
  if (!report) return null;

  const data = report.report_data || {};
  const status = STATUS_BADGE[report.status] || STATUS_BADGE.submitted;
  const severityText = SEVERITY_TEXT[report.severity?.toLowerCase()] || 'text-pl-muted';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 sm:p-6 border-b border-pl-border bg-pl-sunken text-left">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={status.variant} className={`mb-2 ${status.className || ''}`.trim()}>
                  {report.status?.replace('_', ' ').toUpperCase()}
                </Badge>
                <SheetTitle className="text-pl-text text-xl">{report.title}</SheetTitle>
                <SheetDescription className="text-pl-muted flex flex-wrap items-center gap-2 mt-1">
                  <span>ID: <span className="font-pl-mono tabular-nums">{report.id.substring(0, 8).toUpperCase()}</span></span>
                  <span>•</span>
                  <span>{format(new Date(report.created_at), 'PPpp')}</span>
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-6">
              
              {/* Evidence Section */}
              {(data.photo_url || report.audio_blob_url) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-pl-muted uppercase tracking-wider">Evidence</h4>
                  
                  {data.photo_url && (
                    <div className="rounded-lg overflow-hidden border border-pl-border bg-pl-sunken">
                      <img src={data.photo_url} alt="Evidence" className="w-full h-auto object-contain max-h-64" />
                    </div>
                  )}

                  {report.audio_blob_url && (
                    <div className="bg-pl-sunken p-3 rounded-lg border border-pl-border flex items-center gap-3">
                      <div className="h-8 w-8 bg-pl-surface border border-pl-border rounded-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-pl-muted fill-current" aria-hidden="true" />
                      </div>
                      <audio controls src={report.audio_blob_url} className="w-full h-8" />
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pl-sunken p-3 rounded-lg border border-pl-border min-w-0">
                  <div className="text-xs text-pl-muted uppercase mb-1">Severity</div>
                  <div className={`flex items-center gap-2 font-medium capitalize ${severityText}`}>
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    {report.severity || 'n/a'}
                  </div>
                </div>
                <div className="bg-pl-sunken p-3 rounded-lg border border-pl-border min-w-0">
                  <div className="text-xs text-pl-muted uppercase mb-1">Location</div>
                  <div className="flex items-center gap-2 font-medium truncate" title={report.location}>
                    <MapPin className="h-4 w-4 text-pl-muted shrink-0" aria-hidden="true" />
                    {report.location || 'n/a'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-pl-muted uppercase tracking-wider mb-2">Description</h4>
                <div className="bg-pl-sunken p-4 rounded-lg border border-pl-border text-sm leading-relaxed text-pl-text">
                  {report.description || 'n/a'}
                </div>
              </div>

              {/* Closure Details (if closed) */}
              {report.status === 'closed' && (
                <div className="bg-pl-success-bg border border-pl-success/40 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-pl-success-text uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Archive className="h-4 w-4" /> Closure Report
                  </h4>
                  <div className="space-y-3">
                    <div>
                        <span className="text-xs text-pl-muted block">Root Cause</span>
                        <p className="text-sm text-pl-text">{report.root_cause || data.closure_details?.rootCause || 'n/a'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-pl-muted block">Corrective Action</span>
                        <p className="text-sm text-pl-text">{report.corrective_action || data.closure_details?.correctiveAction || 'n/a'}</p>
                    </div>
                    {data.closure_details?.lessonsLearned && (
                        <div>
                            <span className="text-xs text-pl-muted block">Lessons Learned</span>
                            <p className="text-sm text-pl-text">{data.closure_details.lessonsLearned}</p>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Transcription */}
              {report.transcription && (
                <div>
                  <h4 className="text-sm font-semibold text-pl-muted uppercase tracking-wider mb-2">Voice Transcription</h4>
                  <div className="bg-pl-sunken p-4 rounded-lg border border-pl-border text-sm leading-relaxed text-pl-muted italic">
                    "{report.transcription}"
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {data.actions_taken && data.actions_taken.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-pl-muted uppercase tracking-wider mb-2">Recommended Actions (AI)</h4>
                  <div className="space-y-2">
                    {data.actions_taken.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-pl-text bg-pl-sunken p-2 rounded border border-pl-border">
                        <CheckCircle2 className="h-4 w-4 text-pl-success-text mt-0.5 shrink-0" aria-hidden="true" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-pl-muted uppercase tracking-wider mb-4">Activity Timeline</h4>
                <div className="relative border-l border-pl-border ml-2 space-y-6">
                  
                  {/* Closed */}
                  {report.status === 'closed' && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-pl-success border-2 border-pl-raised" aria-hidden="true"></div>
                      <p className="text-sm font-medium text-pl-text">Report Closed</p>
                      <p className="text-xs text-pl-muted">
                        {data.closed_at ? format(new Date(data.closed_at), 'PP p') : 'Unknown Date'}
                      </p>
                    </div>
                  )}

                  {/* Assigned */}
                  {(report.assigned_to || data.assigned_at) && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-pl-info border-2 border-pl-raised" aria-hidden="true"></div>
                      <p className="text-sm font-medium text-pl-text">Assigned to Team Member</p>
                      <p className="text-xs text-pl-muted">
                        {data.assigned_at ? format(new Date(data.assigned_at), 'PP p') : 'Unknown Date'}
                      </p>
                      {data.assignment_note && <p className="text-xs text-pl-muted mt-1">"{data.assignment_note}"</p>}
                    </div>
                  )}

                  {/* Acknowledged */}
                  {data.acknowledged_at && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-pl-warning border-2 border-pl-raised" aria-hidden="true"></div>
                      <p className="text-sm font-medium text-pl-text">Acknowledged by Supervisor</p>
                      <p className="text-xs text-pl-muted">{format(new Date(data.acknowledged_at), 'PP p')}</p>
                    </div>
                  )}

                  {/* Created */}
                  <div className="ml-6 relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-pl-primary border-2 border-pl-raised" aria-hidden="true"></div>
                    <p className="text-sm font-medium text-pl-text">Report Submitted</p>
                    <p className="text-xs text-pl-muted">{format(new Date(report.created_at), 'PP p')}</p>
                  </div>

                </div>
              </div>

            </div>
          </ScrollArea>

          <div className="p-4 border-t border-pl-border bg-pl-sunken flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {report.status !== 'closed' && (
               <Button>Add Comment</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}