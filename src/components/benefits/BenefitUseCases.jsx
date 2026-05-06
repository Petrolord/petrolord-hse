import React from 'react';
import { User } from 'lucide-react';

export default function BenefitUseCases({ useCases }) {
  return (
    <section className="py-24 bg-[#1a1a2e] border-y border-[#3a3a5a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">See It In Action</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="bg-[#1f1f35] rounded-xl p-8 border border-[#3a3a5a] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FFC107]" />
              <div className="flex items-start gap-6">
                <div className="h-14 w-14 rounded-full bg-[#252541] flex items-center justify-center border border-[#3a3a5a] flex-shrink-0">
                  <User className="h-6 w-6 text-[#b0b0c0]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{useCase.role}</h4>
                  <p className="text-[#b0b0c0] italic">"{useCase.scenario}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}