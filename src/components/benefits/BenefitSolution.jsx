import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function BenefitSolution({ data }) {
  return (
    <section className="py-24 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">The Solution</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{data.title}</h2>
          <p className="text-xl text-[#b0b0c0]">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-[#1f1f35] p-8 rounded-xl border border-[#3a3a5a] h-full hover:border-[#FFC107]/50 transition-all hover:-translate-y-1">
                <div className="h-10 w-10 bg-[#FFC107] rounded-full flex items-center justify-center text-[#1a1a2e] font-bold text-lg mb-6">
                  {idx + 1}
                </div>
                <p className="text-white font-medium text-lg leading-snug">
                  {step}
                </p>
              </div>
              {idx < data.steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-[#3a3a5a] z-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}