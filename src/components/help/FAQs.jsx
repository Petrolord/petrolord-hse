import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { faqs } from '@/data/helpContent';
import { accountEmpty } from '@/components/account/accountChrome';

export default function FAQs() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-2">Frequently Asked Questions</h2>
          <p className="text-pl-muted">Quick answers to common questions.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
          <Input 
            placeholder="Search FAQs..." 
            className="pl-9"
            aria-label="Search FAQs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((category, idx) => (
            <div key={idx} className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-4 sm:p-6">
              <h3 className="text-xl font-semibold text-pl-text mb-4">{category.category}</h3>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, fIdx) => (
                  <AccordionItem key={fIdx} value={`item-${idx}-${fIdx}`}>
                    <AccordionTrigger className="text-left hover:text-pl-primary-text">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-pl-muted leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className={accountEmpty}>
            No questions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}