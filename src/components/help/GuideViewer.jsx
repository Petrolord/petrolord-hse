import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Book, FileText, PlayCircle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col h-[calc(100vh-200px)] bg-[#1a1a2e] rounded-xl overflow-hidden border border-[#3a3a5a]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#3a3a5a] bg-[#252541]">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Guides
        </Button>
        <div className="h-6 w-px bg-[#3a3a5a]" />
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {guide.icon && <guide.icon className="h-5 w-5 text-[#FFC107]" />}
            {guide.title}
          </h2>
          <p className="text-xs text-gray-400">{guide.description}</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-[#1f1f35] border-r border-[#3a3a5a] flex flex-col">
          <div className="p-4 border-b border-[#3a3a5a]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
              <Input 
                placeholder="Filter topics..." 
                className="h-8 pl-8 bg-[#131320] border-[#3a3a5a] text-xs text-white" 
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
                        ? "bg-[#FFC107]/10 text-[#FFC107]" 
                        : "text-gray-400 hover:bg-[#252541] hover:text-white"
                    )}
                  >
                    <span>{section.title}</span>
                    {activeSectionId === section.id && <div className="h-1.5 w-1.5 rounded-full bg-[#FFC107]" />}
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#1a1a2e] overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              {activeSection && (
                <>
                  <div className="border-b border-[#3a3a5a] pb-4">
                    <h1 className="text-3xl font-bold text-white mb-2">{activeSection.title}</h1>
                    {activeSection.description && (
                      <p className="text-gray-400 text-lg">{activeSection.description}</p>
                    )}
                  </div>

                  {/* Render Content Blocks */}
                  {activeSection.content && (
                    <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
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
                    <div key={idx} className="mt-8 pt-8 border-t border-[#3a3a5a]/50">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        {sub.icon && <sub.icon className="h-5 w-5 text-blue-400" />}
                        {sub.title}
                      </h3>
                      <div className="prose prose-invert text-gray-400">
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
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#3a3a5a] text-white flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-white">{item.title}</p>
                {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    case 'alert':
      return (
        <div className={cn("p-4 rounded-lg border flex gap-3", 
          block.variant === 'warning' ? "bg-orange-500/10 border-orange-500/30 text-orange-200" : 
          block.variant === 'info' ? "bg-blue-500/10 border-blue-500/30 text-blue-200" :
          "bg-gray-800 border-gray-700"
        )}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            {block.title && <p className="font-bold mb-1">{block.title}</p>}
            <p className="text-sm">{block.text}</p>
          </div>
        </div>
      );
    case 'image':
      return (
        <figure className="my-6">
          <img src={block.src} alt={block.alt} className="rounded-lg border border-[#3a3a5a] w-full" />
          {block.caption && <figcaption className="text-center text-xs text-gray-500 mt-2">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}