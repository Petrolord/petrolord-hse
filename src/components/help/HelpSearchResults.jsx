import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle, X, SearchX } from 'lucide-react';

export default function HelpSearchResults({ query, results, onOpenGuide, onClearSearch, onGoToFaqs }) {
  const { guides = [], faqs = [] } = results || {};
  const total = guides.length + faqs.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {total > 0 ? `${total} result${total === 1 ? '' : 's'} for ` : 'No results for '}
          <span className="text-[#FFC107]">“{query}”</span>
        </h2>
        <Button variant="ghost" onClick={onClearSearch} className="text-gray-400 hover:text-white">
          <X className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      {total === 0 && (
        <div className="text-center py-16 border border-[#3a3a5a] rounded-xl bg-[#252541]">
          <SearchX className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-300 mb-1">We couldn’t find anything matching that.</p>
          <p className="text-sm text-gray-500">Try a different term, browse the Module Guides, or contact Support.</p>
        </div>
      )}

      {guides.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map(({ guide, sections }) => (
              <Card
                key={guide.id}
                className="bg-[#252541] border-[#3a3a5a] hover:border-[#FFC107] transition-all cursor-pointer group"
                onClick={() => onOpenGuide(guide.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-[#1a1a2e] border border-[#3a3a5a] flex items-center justify-center text-[#FFC107]">
                      {guide.icon && <guide.icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white group-hover:text-[#FFC107] transition-colors">{guide.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{guide.description}</p>
                      {sections.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Matches in: {sections.join(' · ')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto mt-1 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">FAQs</h3>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <Card key={i} className="bg-[#252541] border-[#3a3a5a]">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-[#FFC107] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">{item.q}</p>
                      <p className="text-sm text-gray-400 mt-1">{item.a}</p>
                      <button onClick={onGoToFaqs} className="text-xs text-[#FFC107] hover:underline mt-2">
                        Open in FAQs →
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
