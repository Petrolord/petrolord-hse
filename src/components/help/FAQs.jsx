import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { faqs } from '@/data/helpContent';

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
          <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-[#b0b0c0]">Quick answers to common questions.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search FAQs..." 
            className="pl-9 bg-[#252541] border-[#3a3a5a] text-white focus:border-[#FFC107]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((category, idx) => (
            <div key={idx} className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#FFC107] mb-4">{category.category}</h3>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, fIdx) => (
                  <AccordionItem key={fIdx} value={`item-${idx}-${fIdx}`} className="border-b-[#3a3a5a]">
                    <AccordionTrigger className="text-white hover:text-[#FFC107] text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No questions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}