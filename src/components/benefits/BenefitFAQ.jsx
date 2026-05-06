import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function BenefitFAQ({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 bg-[#151525]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Common Questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-[#3a3a5a] rounded-lg bg-[#1f1f35] px-4">
              <AccordionTrigger className="text-white hover:no-underline hover:text-[#FFC107] text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#b0b0c0]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}