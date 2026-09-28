import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function BenefitFAQ({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-pl-surface border-t border-pl-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pl-display text-3xl font-semibold text-pl-text mb-4">Common Questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-pl-border rounded-lg bg-pl-raised px-4">
              <AccordionTrigger className="text-pl-text hover:no-underline hover:text-pl-primary-text text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-pl-muted">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}