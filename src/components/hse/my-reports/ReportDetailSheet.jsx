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

export default function ReportDetailSheet({ report, isOpen, onClose }) {
  if (!report) return null;

  const data = report.report_data || {};

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-[#1a1a2e] border-l border-[#3a3a5a] text-white p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-[#3a3a5a] bg-[#252541]">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {report.status?.replace('_', ' ').toUpperCase()}
                </Badge>
                <SheetTitle className="text-white text-xl">{report.title}</SheetTitle>
                <SheetDescription className="text-gray-400 flex items-center gap-2 mt-1">
                  <span>ID: {report.id.substring(0, 8).toUpperCase()}</span>
                  <span>•</span>
                  <span>{format(new Date(report.created_at), 'PPpp')}</span>
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              
              {/* Evidence Section */}
              {(data.photo_url || report.audio_blob_url) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Evidence</h4>
                  
                  {data.photo_url && (
                    <div className="rounded-lg overflow-hidden border border-[#3a3a5a] bg-black">
                      <img src={data.photo_url} alt="Evidence" className="w-full h-auto object-contain max-h-64" />
                    </div>
                  )}

                  {report.audio_blob_url && (
                    <div className="bg-[#252541] p-3 rounded-lg border border-[#3a3a5a] flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-blue-400 fill-current" />
                      </div>
                      <audio controls src={report.audio_blob_url} className="w-full h-8" />
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252541] p-3 rounded-lg border border-[#3a3a5a]">
                  <div className="text-xs text-gray-500 uppercase mb-1">Severity</div>
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {report.severity}
                  </div>
                </div>
                <div className="bg-[#252541] p-3 rounded-lg border border-[#3a3a5a]">
                  <div className="text-xs text-gray-500 uppercase mb-1">Location</div>
                  <div className="flex items-center gap-2 font-medium truncate" title={report.location}>
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {report.location}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Description</h4>
                <div className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a] text-sm leading-relaxed text-gray-300">
                  {report.description}
                </div>
              </div>

              {/* Closure Details (if closed) */}
              {report.status === 'closed' && (
                <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Archive className="h-4 w-4" /> Closure Report
                  </h4>
                  <div className="space-y-3">
                    <div>
                        <span className="text-xs text-gray-500 block">Root Cause</span>
                        <p className="text-sm text-gray-300">{report.root_cause || data.closure_details?.rootCause || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block">Corrective Action</span>
                        <p className="text-sm text-gray-300">{report.corrective_action || data.closure_details?.correctiveAction || 'N/A'}</p>
                    </div>
                    {data.closure_details?.lessonsLearned && (
                        <div>
                            <span className="text-xs text-gray-500 block">Lessons Learned</span>
                            <p className="text-sm text-gray-300">{data.closure_details.lessonsLearned}</p>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Transcription */}
              {report.transcription && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Voice Transcription</h4>
                  <div className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a] text-sm leading-relaxed text-gray-400 italic">
                    "{report.transcription}"
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {data.actions_taken && data.actions_taken.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Recommended Actions (AI)</h4>
                  <div className="space-y-2">
                    {data.actions_taken.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 bg-green-900/10 p-2 rounded border border-green-900/30">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-[#3a3a5a]" />

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Activity Timeline</h4>
                <div className="relative border-l border-[#3a3a5a] ml-2 space-y-6">
                  
                  {/* Closed */}
                  {report.status === 'closed' && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-green-500 border-2 border-[#1a1a2e]"></div>
                      <p className="text-sm font-medium text-white">Report Closed</p>
                      <p className="text-xs text-gray-500">
                        {data.closed_at ? format(new Date(data.closed_at), 'PP p') : 'Unknown Date'}
                      </p>
                    </div>
                  )}

                  {/* Assigned */}
                  {(report.assigned_to || data.assigned_at) && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-purple-500 border-2 border-[#1a1a2e]"></div>
                      <p className="text-sm font-medium text-white">Assigned to Team Member</p>
                      <p className="text-xs text-gray-500">
                        {data.assigned_at ? format(new Date(data.assigned_at), 'PP p') : 'Unknown Date'}
                      </p>
                      {data.assignment_note && <p className="text-xs text-gray-400 mt-1">"{data.assignment_note}"</p>}
                    </div>
                  )}

                  {/* Acknowledged */}
                  {data.acknowledged_at && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-yellow-500 border-2 border-[#1a1a2e]"></div>
                      <p className="text-sm font-medium text-white">Acknowledged by Supervisor</p>
                      <p className="text-xs text-gray-500">{format(new Date(data.acknowledged_at), 'PP p')}</p>
                    </div>
                  )}

                  {/* Created */}
                  <div className="ml-6 relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-[#1a1a2e]"></div>
                    <p className="text-sm font-medium text-white">Report Submitted</p>
                    <p className="text-xs text-gray-500">{format(new Date(report.created_at), 'PP p')}</p>
                  </div>

                </div>
              </div>

            </div>
          </ScrollArea>

          <div className="p-4 border-t border-[#3a3a5a] bg-[#252541] flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Close</Button>
            {report.status !== 'closed' && (
               <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add Comment</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}