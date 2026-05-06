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
      className: "bg-[#22C55E] text-white border-none" 
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
        className: "bg-[#22C55E] text-white border-none" 
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
      <SheetContent className="w-full sm:max-w-2xl bg-[#1a1a2e] border-l border-[#3a3a5a] text-white p-0 shadow-2xl">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-[#3a3a5a] bg-[#1f1f35]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <Badge 
                  className="border-none px-3 py-1 font-semibold uppercase tracking-wider rounded-sm"
                  style={{ backgroundColor: `${moment.category?.color}20`, color: moment.category?.color || '#fff' }}
                >
                  {moment.category?.name || 'General Safety'}
                </Badge>
                
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={() => onToggleSave(moment.id)} className="text-[#FFC107] hover:text-[#FFD54F] hover:bg-[#252541]">
                      <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                   </Button>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-[#252541] border-[#3a3a5a] text-white hover:bg-[#3a3a5a] hover:text-[#FFC107]">
                           <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#252541] border-[#3a3a5a] text-white w-48" align="end">
                         <DropdownMenuItem onClick={() => handleDownload('pdf')} className="hover:bg-[#3a3a5a] cursor-pointer focus:bg-[#3a3a5a] focus:text-[#FFC107]">
                            <FileText className="mr-2 h-4 w-4 text-red-400" /> PDF Document
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDownload('pptx')} className="hover:bg-[#3a3a5a] cursor-pointer focus:bg-[#3a3a5a] focus:text-[#FFC107]">
                            <Presentation className="mr-2 h-4 w-4 text-orange-400" /> PowerPoint Slide
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDownload('docx')} className="hover:bg-[#3a3a5a] cursor-pointer focus:bg-[#3a3a5a] focus:text-[#FFC107]">
                            <FileText className="mr-2 h-4 w-4 text-blue-400" /> Word Document
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>

              <SheetTitle className="text-2xl font-bold text-white leading-tight pr-4">
                {moment.title}
              </SheetTitle>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-[#b0b0c0]">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#22C55E]" /> {moment.duration} min duration</span>
                <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4 text-[#3b82f6]" /> {moment.shares_count || 0} Shares</span>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-8 max-w-full pb-10">
              
              {/* When to use */}
              {moment.when_to_use && (
                <section className="bg-[#252541]/50 p-4 rounded-lg border border-[#3a3a5a]/50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[#7a7a9a] uppercase tracking-widest">When to use</h3>
                  </div>
                  <p className="text-[#e0e0e0] text-sm whitespace-pre-line">{moment.when_to_use}</p>
                </section>
              )}

              {/* Why It Matters */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-[#FFC107] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Why It Matters
                  </h3>
                  <Button variant="ghost" size="xs" onClick={() => handleCopySection(moment.why_it_matters || moment.description, 'Why It Matters')} className="h-6 w-6 p-0 text-[#7a7a9a] hover:text-white">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-[#e0e0e0] leading-relaxed text-base space-y-2 whitespace-pre-line">
                  {moment.why_it_matters || moment.description || "Content coming soon..."}
                </div>
              </section>

              <Separator className="bg-[#3a3a5a]" />

              {/* Key Talking Points */}
              {keyPoints && keyPoints.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="h-4 w-4" /> Key Talking Points
                    </h3>
                    <Button variant="ghost" size="xs" onClick={() => handleCopySection(keyPoints.join('\n'), 'Key Points')} className="h-6 w-6 p-0 text-[#7a7a9a] hover:text-white">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3 bg-[#252541] p-3 rounded border-l-2 border-[#22C55E]">
                        <span className="font-mono text-[#22C55E] text-sm font-bold mt-0.5 shrink-0">{i+1}.</span>
                        <span className="text-white text-sm leading-relaxed whitespace-pre-line">{pt}</span>
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
                    <section className="bg-[#252541]/30 p-4 rounded-lg border border-[#22C55E]/20">
                      <h3 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Do This
                      </h3>
                      <ul className="space-y-2">
                        {moment.do_list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#e0e0e0]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E] mt-1 shrink-0" />
                            <span className="whitespace-pre-line">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Don't List */}
                  {moment.dont_list?.length > 0 && (
                    <section className="bg-[#252541]/30 p-4 rounded-lg border border-red-500/20">
                      <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> Avoid This
                      </h3>
                      <ul className="space-y-2">
                        {moment.dont_list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#e0e0e0]">
                            <XCircle className="h-3.5 w-3.5 text-red-400 mt-1 shrink-0" />
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
                <section className="bg-gradient-to-r from-[#1e3a8a]/40 to-[#252541] border border-[#1e40af]/30 rounded-lg p-5 shadow-lg shadow-blue-900/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Real World Scenario
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#1a1a2e]/60 p-3 rounded-md border border-[#3a3a5a]/50">
                      <h4 className="text-xs font-bold text-[#b0b0c0] uppercase mb-1">What Happened</h4>
                      <p className="text-[#e0e0e0] text-sm italic whitespace-pre-line">"{moment.incident_scenario.what_happened}"</p>
                    </div>
                    
                    {moment.incident_scenario.what_should_happen && (
                      <div className="bg-[#1a1a2e]/60 p-3 rounded-md border border-[#3a3a5a]/50">
                        <h4 className="text-xs font-bold text-[#b0b0c0] uppercase mb-1 flex items-center gap-1">
                           <ArrowRight className="h-3 w-3 text-emerald-500" /> What Should Have Happened
                        </h4>
                        <p className="text-white text-sm whitespace-pre-line">{moment.incident_scenario.what_should_happen}</p>
                      </div>
                    )}

                    {moment.incident_scenario.lesson && (
                      <div className="bg-[#1e3a8a]/20 p-3 rounded border border-[#1e40af]/20">
                        <h4 className="text-xs font-bold text-blue-300 uppercase mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> The Lesson
                        </h4>
                        <p className="text-white text-sm font-medium whitespace-pre-line">{moment.incident_scenario.lesson}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Discussion Questions */}
              {moment.discussion_questions && moment.discussion_questions.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-[#b0b0c0] uppercase tracking-wider mb-3">Engagement Questions</h3>
                  <div className="space-y-3">
                    {moment.discussion_questions.map((q, i) => (
                      <div key={i} className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a] hover:border-[#7a7a9a] transition-colors">
                        <p className="text-[#FFC107] font-bold text-xs uppercase mb-1">Question {i+1}</p>
                        <p className="text-white font-medium text-sm whitespace-pre-line">{q}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Site Checklist */}
              {moment.site_checklist && moment.site_checklist.length > 0 && (
                <section className="bg-[#252541]/30 border border-[#3a3a5a] rounded-lg p-5">
                  <h3 className="text-sm font-bold text-[#e0e0e0] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-[#22C55E]" /> Site Checklist
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {moment.site_checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded border border-[#7a7a9a] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="h-3 w-3 bg-transparent" />
                        </div>
                        <span className="text-sm text-[#b0b0c0]">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* References */}
              {moment.references && moment.references.length > 0 && (
                <section className="pt-4 border-t border-[#3a3a5a]">
                  <h3 className="text-xs font-bold text-[#7a7a9a] uppercase tracking-widest mb-2">References & Standards</h3>
                  <div className="flex flex-wrap gap-2">
                    {moment.references.map((ref, i) => (
                      <Badge key={i} variant="outline" className="text-[#7a7a9a] border-[#3a3a5a] bg-[#1a1a2e]">{ref}</Badge>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#3a3a5a] bg-[#1f1f35] flex items-center justify-between gap-4">
             <Button variant="outline" onClick={() => handleCopySection(moment.one_minute_recap || moment.description, 'Full Text')} className="flex-1 bg-[#252541] border-[#3a3a5a] text-[#e0e0e0] hover:bg-[#3a3a5a] hover:text-white">
               <Copy className="mr-2 h-4 w-4" /> Copy All Text
             </Button>
             <Button className="flex-1 bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold shadow-lg shadow-[#22C55E]/20">
               <Share2 className="mr-2 h-4 w-4" /> Share with Team
             </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}