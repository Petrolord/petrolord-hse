import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from './data';

export default function PricingFAQ() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="font-pl-display text-3xl font-semibold text-pl-text mb-4">Frequently Asked Questions</h2>
        <p className="text-pl-muted">Everything you need to know about billing and plans.</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-pl-border rounded-lg bg-pl-surface px-4 sm:px-6">
            <AccordionTrigger className="text-pl-text text-base sm:text-lg font-medium hover:no-underline hover:text-pl-primary-text text-left py-5">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-pl-muted pb-6 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}