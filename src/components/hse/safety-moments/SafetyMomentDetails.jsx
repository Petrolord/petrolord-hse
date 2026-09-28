import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Share2, Copy, Bookmark, CheckCircle2, XCircle, AlertTriangle, FileText, Download, Presentation, ListChecks, ArrowRight } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { exportToPDF, exportToPPTX, exportToWord } from '@/utils/exportUtils';
import { safetyMomentService } from '@/services/safetyMomentService';
import { useHSE } from '@/context/HSEContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function SafetyMomentDetails({ moment, isOpen, onClose, isSaved, onToggleSave }) {
  const { toast } = useToast();
  const { currentUser } = useHSE();
  const [exporting, setExporting] = useState(false);

  React.useEffect(() => {
    if (isOpen && moment?.id && currentUser) {
      safetyMomentService.trackView(moment.id, currentUser.id);
    }
  }, [isOpen, moment, currentUser]);

  if (!moment) return null;

  const handleCopySection = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: "Copied to Clipboard", 
      description: `${sectionName} copied successfully.`, 
      variant: "success"
    });
  };

  const handleDownload = async (format) => {
    setExporting(true);
    try {
      if (format === 'pdf') await exportToPDF(moment, currentUser);
      if (format === 'pptx') await exportToPPTX(moment);
      if (format === 'docx') await exportToWord(moment);
      
      await safetyMomentService.trackDownload(moment.id, currentUser?.id, format);
      toast({ 
        title: "Export Complete", 
        description: `Your ${format.toUpperCase()} document is ready.`, 
        variant: "success"
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Export Failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  // Helper to get key points regardless of field name (DB uses key_points, seed uses key_talking_points)
  const keyPoints = moment.key_points || moment.key_talking_points || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <SheetHeader className="px-4 sm:px-6 py-5 border-b border-pl-border bg-pl-surface text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-3 pr-8">
                <Badge 
                  variant="neutral"
                  className="px-3 py-1 font-semibold uppercase tracking-wider rounded-sm"
                >
                  {moment.category?.name || 'General Safety'}
                </Badge>
                
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={() => onToggleSave(moment.id)} aria-pressed={isSaved} aria-label={isSaved ? 'Saved' : 'Save'} title={isSaved ? 'Saved' : 'Save'} className={isSaved ? 'text-pl-accent-text' : undefined}>
                      <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
                   </Button>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                           <Download className="h-4 w-4 mr-2" aria-hidden="true" /> Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                         <DropdownMenuItem onClick={() => handleDownload('pdf')} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-pl-muted" aria-hidden="true" /> PDF Document
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDownload('pptx')} className="cursor-pointer">
                            <Presentation className="mr-2 h-4 w-4 text-pl-muted" aria-hidden="true" /> PowerPoint Slide
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDownload('docx')} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-pl-muted" aria-hidden="true" /> Word Document
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>

              <SheetTitle className="font-pl-display text-2xl font-semibold text-pl-text leading-tight pr-4">
                {moment.title}
              </SheetTitle>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-pl-muted">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" /> <span className="font-pl-mono tabular-nums">{moment.duration ?? 'n/a'}</span> min duration</span>
                <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4" aria-hidden="true" /> <span className="font-pl-mono tabular-nums">{moment.shares_count || 0}</span> Shares</span>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 sm:px-6 py-6">
            <div className="space-y-8 max-w-full pb-10">
              
              {/* When to use */}
              {moment.when_to_use && (
                <section className="bg-pl-sunken p-4 rounded-lg border border-pl-border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-pl-muted uppercase tracking-widest">When to use</h3>
                  </div>
                  <p className="text-pl-text text-sm whitespace-pre-line">{moment.when_to_use}</p>
                </section>
              )}

              {/* Why It Matters */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-pl-text uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Why It Matters
                  </h3>
                  <Button variant="ghost" size="xs" onClick={() => handleCopySection(moment.why_it_matters || moment.description, 'Why It Matters')} className="h-6 w-6 p-0" aria-label="Copy" title="Copy">
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
                <div className="text-pl-text leading-relaxed text-base space-y-2 whitespace-pre-line">
                  {moment.why_it_matters || moment.description || "Content coming soon..."}
                </div>
              </section>

              <Separator />

              {/* Key Talking Points */}
              {keyPoints && keyPoints.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-pl-text uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Key Talking Points
                    </h3>
                    <Button variant="ghost" size="xs" onClick={() => handleCopySection(keyPoints.join('\n'), 'Key Points')} className="h-6 w-6 p-0" aria-label="Copy" title="Copy">
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3 bg-pl-sunken p-3 rounded border-l-2 border-pl-primary">
                        <span className="font-pl-mono tabular-nums text-pl-primary-text text-sm font-bold mt-0.5 shrink-0">{i+1}.</span>
                        <span className="text-pl-text text-sm leading-relaxed whitespace-pre-line">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Do's and Don'ts */}
              {(moment.do_list?.length > 0 || moment.dont_list?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Do List */}
                  {moment.do_list?.length > 0 && (
                    <section className="bg-pl-success-bg p-4 rounded-lg border border-pl-success/40">
                      <h3 className="text-sm font-bold text-pl-success-text uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Do This
                      </h3>
                      <ul className="space-y-2">
                        {moment.do_list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-pl-text">
                            <CheckCircle2 className="h-3.5 w-3.5 text-pl-success-text mt-1 shrink-0" aria-hidden="true" />
                            <span className="whitespace-pre-line">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Don't List */}
                  {moment.dont_list?.length > 0 && (
                    <section className="bg-pl-danger-bg p-4 rounded-lg border border-pl-danger/40">
                      <h3 className="text-sm font-bold text-pl-danger-text uppercase tracking-wider mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4" aria-hidden="true" /> Avoid This
                      </h3>
                      <ul className="space-y-2">
                        {moment.dont_list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-pl-text">
                            <XCircle className="h-3.5 w-3.5 text-pl-danger-text mt-1 shrink-0" aria-hidden="true" />
                            <span className="whitespace-pre-line">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {/* Incident Scenario */}
              {moment.incident_scenario && (moment.incident_scenario.what_happened || moment.incident_scenario.lesson) && (
                <section className="bg-pl-info-bg border border-pl-info/40 rounded-lg p-4 sm:p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-pl-info-text uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Real World Scenario
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-pl-surface p-3 rounded-md border border-pl-border">
                      <h4 className="text-xs font-bold text-pl-muted uppercase mb-1">What Happened</h4>
                      <p className="text-pl-text text-sm italic whitespace-pre-line">"{moment.incident_scenario.what_happened}"</p>
                    </div>
                    
                    {moment.incident_scenario.what_should_happen && (
                      <div className="bg-pl-surface p-3 rounded-md border border-pl-border">
                        <h4 className="text-xs font-bold text-pl-muted uppercase mb-1 flex items-center gap-1">
                           <ArrowRight className="h-3 w-3" aria-hidden="true" /> What Should Have Happened
                        </h4>
                        <p className="text-pl-text text-sm whitespace-pre-line">{moment.incident_scenario.what_should_happen}</p>
                      </div>
                    )}

                    {moment.incident_scenario.lesson && (
                      <div className="bg-pl-surface p-3 rounded border border-pl-info/40">
                        <h4 className="text-xs font-bold text-pl-info-text uppercase mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> The Lesson
                        </h4>
                        <p className="text-pl-text text-sm font-medium whitespace-pre-line">{moment.incident_scenario.lesson}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Discussion Questions */}
              {moment.discussion_questions && moment.discussion_questions.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-pl-text uppercase tracking-wider mb-3">Engagement Questions</h3>
                  <div className="space-y-3">
                    {moment.discussion_questions.map((q, i) => (
                      <div key={i} className="bg-pl-sunken p-4 rounded-lg border border-pl-border">
                        <p className="text-pl-muted font-bold text-xs uppercase mb-1">Question <span className="font-pl-mono tabular-nums">{i+1}</span></p>
                        <p className="text-pl-text font-medium text-sm whitespace-pre-line">{q}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Site Checklist */}
              {moment.site_checklist && moment.site_checklist.length > 0 && (
                <section className="bg-pl-sunken border border-pl-border rounded-lg p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-pl-text uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Site Checklist
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {moment.site_checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded border border-pl-border-strong bg-pl-surface flex items-center justify-center shrink-0 mt-0.5">
                          <div className="h-3 w-3 bg-transparent" />
                        </div>
                        <span className="text-sm text-pl-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* References */}
              {moment.references && moment.references.length > 0 && (
                <section className="pt-4 border-t border-pl-border">
                  <h3 className="text-xs font-bold text-pl-muted uppercase tracking-widest mb-2">References & Standards</h3>
                  <div className="flex flex-wrap gap-2">
                    {moment.references.map((ref, i) => (
                      <Badge key={i} variant="neutral">{ref}</Badge>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-pl-border bg-pl-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
             <Button variant="outline" onClick={() => handleCopySection(moment.one_minute_recap || moment.description, 'Full Text')} className="flex-1">
               <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Copy All Text
             </Button>
             <Button className="flex-1 font-semibold">
               <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> Share with Team
             </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}