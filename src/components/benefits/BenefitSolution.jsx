import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function BenefitSolution({ data }) {
  return (
    <section className="py-16 sm:py-24 bg-pl-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-pl-primary-text font-bold tracking-wider uppercase text-sm mb-2 block">The Solution</span>
          <h2 className="font-pl-display text-3xl md:text-4xl font-semibold text-pl-text mb-6">{data.title}</h2>
          <p className="text-lg sm:text-xl text-pl-muted">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-pl-surface p-8 rounded-xl border border-pl-border h-full shadow-pl-sm hover:border-pl-primary/50 transition-all hover:-translate-y-1">
                <div className="h-10 w-10 bg-pl-primary rounded-full flex items-center justify-center text-pl-primary-fg font-pl-mono tabular-nums font-bold text-lg mb-6">
                  {idx + 1}
                </div>
                <p className="text-pl-text font-medium text-lg leading-snug">
                  {step}
                </p>
              </div>
              {idx < data.steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-pl-border-strong z-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}