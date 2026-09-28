import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function BenefitProblem({ data }) {
  return (
    <section className="py-16 sm:py-24 bg-pl-surface border-y border-pl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-pl-accent-text font-semibold mb-4">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <span>THE CHALLENGE</span>
            </div>
            <h2 className="font-pl-display text-3xl md:text-4xl font-semibold text-pl-text mb-6">
              {data.title}
            </h2>
            <p className="text-lg text-pl-muted leading-relaxed mb-8">
              {data.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.stats.map((stat, idx) => (
              <div key={idx} className="bg-pl-raised p-6 rounded-xl border border-pl-border text-center">
                <div className="text-3xl font-bold text-pl-text mb-2">{stat.value}</div>
                <div className="text-sm text-pl-muted font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}