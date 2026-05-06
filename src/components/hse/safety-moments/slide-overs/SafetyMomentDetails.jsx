import React from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, X, Copy, Share2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { exportToPDF, exportToPPTX } from '@/utils/exportUtils';
import PetrolordSafetyMasterTemplate from '../PetrolordSafetyMasterTemplate';

/**
 * REPLACED: Now renders the Slide Master Template directly.
 * This ensures users see exactly what the slide deck looks like.
 */
export default function SafetyMomentDetails({ moment, isOpen, onClose }) {
  const { toast } = useToast();

  if (!moment) return null;

  const handleDownload = async (format) => {
    try {
      if (format === 'pdf') await exportToPDF(moment);
      if (format === 'pptx') await exportToPPTX(moment);
      
      toast({ 
        title: "Export Complete", 
        description: `Your ${format.toUpperCase()} is ready.`, 
        className: "bg-[#22C55E] text-white border-none" 
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Export Failed", description: "Please try again later.", variant: "destructive" });
    }
  };

  const handleCopyText = () => {
    const text = `
${moment.title}
${moment.why_it_matters || moment.description}

Key Points:
${(moment.key_points || []).map(p => `- ${p}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[95vw] md:max-w-[1400px] bg-black/95 p-0 border-none text-white overflow-hidden flex flex-col"
      >
        {/* Header Toolbar */}
        <div className="h-16 bg-[#1a1a2e] border-b border-[#3a3a5a] flex items-center justify-between px-6 shrink-0 z-50">
          <h2 className="text-white font-bold text-lg truncate pr-4 flex items-center gap-2">
            <span className="text-[#F4B860] uppercase tracking-wider text-xs font-extrabold border border-[#F4B860] px-2 py-0.5 rounded">
              {moment.category?.name || 'SAFETY'}
            </span>
            {moment.title} 
          </h2>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyText}
              className="text-[#b0b0c0] hover:text-white hidden sm:flex"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Text
            </Button>
            <div className="h-6 w-[1px] bg-[#3a3a5a] mx-2 hidden sm:block" />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload('pdf')}
              className="border-[#F4B860]/50 text-[#F4B860] hover:bg-[#F4B860] hover:text-[#0F1B2E]"
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload('pptx')}
              className="border-[#F4B860]/50 text-[#F4B860] hover:bg-[#F4B860] hover:text-[#0F1B2E]"
            >
              <Download className="mr-2 h-4 w-4" /> PPTX
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#b0b0c0] hover:text-white ml-2">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Slide Content Viewer */}
        <div className="flex-1 overflow-y-auto bg-black/50 scrollbar-thin scrollbar-thumb-[#3a3a5a]">
          <PetrolordSafetyMasterTemplate moment={moment} />
        </div>

      </SheetContent>
    </Sheet>
  );
}