import React from 'react';
import { User } from 'lucide-react';

export default function BenefitUseCases({ useCases }) {
  return (
    <section className="py-16 sm:py-24 bg-pl-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-pl-display text-3xl font-semibold text-pl-text">See It In Action</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="bg-pl-surface rounded-xl p-6 sm:p-8 border border-pl-border shadow-pl-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-pl-accent" />
              <div className="flex items-start gap-6">
                <div className="h-14 w-14 rounded-full bg-pl-sunken flex items-center justify-center border border-pl-border flex-shrink-0">
                  <User className="h-6 w-6 text-pl-muted" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-pl-text mb-2">{useCase.role}</h4>
                  <p className="text-pl-muted italic">"{useCase.scenario}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}