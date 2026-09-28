import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle, X, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { accountEmpty } from '@/components/account/accountChrome';

export default function HelpSearchResults({ query, results, onOpenGuide, onClearSearch, onGoToFaqs }) {
  const { guides = [], faqs = [] } = results || {};
  const total = guides.length + faqs.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-pl-text min-w-0 break-words">
          {total > 0 ? `${total} result${total === 1 ? '' : 's'} for ` : 'No results for '}
          <span className="text-pl-primary-text">“{query}”</span>
        </h2>
        <Button variant="ghost" onClick={onClearSearch} className="shrink-0">
          <X className="mr-2 h-4 w-4" aria-hidden="true" /> Clear
        </Button>
      </div>

      {total === 0 && (
        <div className={cn(accountEmpty, 'py-16 rounded-xl')}>
          <SearchX className="h-12 w-12 mx-auto mb-4 text-pl-muted" aria-hidden="true" />
          <p className="text-base text-pl-text mb-1">We couldn’t find anything matching that.</p>
          <p className="text-sm text-pl-muted">Try a different term, browse the Module Guides, or contact Support.</p>
        </div>
      )}

      {guides.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-pl-muted">Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map(({ guide, sections }) => (
              <Card
                key={guide.id}
                className="hover:border-pl-primary hover:shadow-pl-md transition-all cursor-pointer group"
                onClick={() => onOpenGuide(guide.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-pl-sunken border border-pl-border flex items-center justify-center text-pl-primary-text">
                      {guide.icon && <guide.icon className="h-5 w-5" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-pl-text group-hover:text-pl-primary-text transition-colors">{guide.title}</h4>
                      <p className="text-sm text-pl-muted line-clamp-2">{guide.description}</p>
                      {sections.length > 0 && (
                        <p className="text-xs text-pl-muted mt-2">
                          Matches in: {sections.join(' · ')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-pl-muted group-hover:text-pl-text group-hover:translate-x-1 transition-all ml-auto mt-1 shrink-0" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-pl-muted">FAQs</h3>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-pl-primary-text shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-pl-text">{item.q}</p>
                      <p className="text-sm text-pl-muted mt-1">{item.a}</p>
                      <button onClick={onGoToFaqs} className="text-xs text-pl-primary-text hover:underline mt-2 inline-flex items-center gap-1">
                        Open in FAQs <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
