import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Book, FileText, PlayCircle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Design family (batch 2C): the guide reader on the theme roles. Alert blocks
// use the warning and info status roles, and carry their title word.
export default function GuideViewer({ guide, onBack }) {
  const [activeSectionId, setActiveSectionId] = useState(guide.sections[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeSection = guide.sections.find(s => s.id === activeSectionId);

  // Filter sections for sidebar based on search
  const filteredSections = guide.sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subsections?.some(sub => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[520px] bg-pl-surface rounded-xl overflow-hidden border border-pl-border shadow-pl-sm">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 border-b border-pl-border bg-pl-sunken">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Back to Guides
        </Button>
        <div className="hidden sm:block h-6 w-px bg-pl-border" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-pl-text flex items-center gap-2">
            {guide.icon && <guide.icon className="h-5 w-5 text-pl-primary-text" aria-hidden="true" />}
            {guide.title}
          </h2>
          <p className="text-xs text-pl-muted">{guide.description}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation: a short list above the article at phone width */}
        <div className="w-full max-h-48 md:max-h-none md:w-64 shrink-0 bg-pl-sunken border-b md:border-b-0 md:border-r border-pl-border flex flex-col">
          <div className="p-3 md:p-4 border-b border-pl-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-pl-muted" aria-hidden="true" />
              <Input 
                placeholder="Filter topics..." 
                aria-label="Filter topics"
                className="h-8 pl-8 text-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredSections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => setActiveSectionId(section.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between group",
                      activeSectionId === section.id 
                        ? "bg-pl-primary/10 text-pl-primary-text" 
                        : "text-pl-muted hover:bg-pl-surface hover:text-pl-text"
                    )}
                    aria-current={activeSectionId === section.id ? 'true' : undefined}
                  >
                    <span>{section.title}</span>
                    {activeSectionId === section.id && <div className="h-1.5 w-1.5 rounded-full bg-pl-primary" aria-hidden="true" />}
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 bg-pl-surface overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              {activeSection && (
                <>
                  <div className="border-b border-pl-border pb-4">
                    <h1 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-2">{activeSection.title}</h1>
                    {activeSection.description && (
                      <p className="text-pl-muted text-lg">{activeSection.description}</p>
                    )}
                  </div>

                  {/* Render Content Blocks */}
                  {activeSection.content && (
                    <div className="max-w-none text-pl-text space-y-6">
                      {typeof activeSection.content === 'string' ? (
                        <div dangerouslySetInnerHTML={{ __html: activeSection.content }} />
                      ) : (
                        activeSection.content.map((block, idx) => (
                          <ContentBlock key={idx} block={block} />
                        ))
                      )}
                    </div>
                  )}

                  {/* Subsections if any */}
                  {activeSection.subsections?.map((sub, idx) => (
                    <div key={idx} className="mt-8 pt-8 border-t border-pl-border">
                      <h3 className="text-xl font-semibold text-pl-text mb-4 flex items-center gap-2">
                        {sub.icon && <sub.icon className="h-5 w-5 text-pl-primary-text" aria-hidden="true" />}
                        {sub.title}
                      </h3>
                      <div className="text-pl-muted space-y-4">
                        {typeof sub.content === 'string' ? (
                           <div dangerouslySetInnerHTML={{ __html: sub.content }} />
                        ) : (
                           sub.content.map((b, i) => <ContentBlock key={i} block={b} />)
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function ContentBlock({ block }) {
  if (!block) return null;

  switch (block.type) {
    case 'paragraph':
      return <p className="leading-relaxed">{block.text}</p>;
    case 'list':
      return (
        <ul className="list-disc pl-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'step-list':
      return (
        <div className="space-y-4">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-pl-sunken border border-pl-border text-pl-text flex items-center justify-center text-xs font-bold font-pl-mono tabular-nums mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-pl-text">{item.title}</p>
                {item.description && <p className="text-sm text-pl-muted mt-1">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    case 'alert':
      return (
        <div className={cn("p-4 rounded-lg border flex gap-3", 
          block.variant === 'warning' ? "bg-pl-warning-bg border-pl-warning/40 text-pl-warning-text" : 
          block.variant === 'info' ? "bg-pl-info-bg border-pl-info/40 text-pl-info-text" :
          "bg-pl-sunken border-pl-border text-pl-text"
        )}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <div>
            {block.title && <p className="font-bold mb-1">{block.title}</p>}
            <p className="text-sm">{block.text}</p>
          </div>
        </div>
      );
    case 'image':
      return (
        <figure className="my-6">
          <img src={block.src} alt={block.alt} className="rounded-lg border border-pl-border w-full" />
          {block.caption && <figcaption className="text-center text-xs text-pl-muted mt-2">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}