import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from './data';

export default function PricingFAQ() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-[#b0b0c0]">Everything you need to know about billing and plans.</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-[#3a3a5a] rounded-lg bg-[#1f1f35] px-6">
            <AccordionTrigger className="text-white text-lg font-medium hover:no-underline hover:text-[#FFC107] text-left py-6">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-[#b0b0c0] pb-6 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}