import React from 'react';

export default function DocumentationSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16 border-b border-pl-border pb-12 last:border-0">
      <h2 className="text-2xl font-semibold text-pl-text mb-6 flex items-center group">
        <span className="text-pl-accent-text mr-2 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true">#</span>
        {title}
      </h2>
      <div className="text-pl-text leading-relaxed space-y-4 text-base sm:text-lg">
        {children}
      </div>
    </section>
  );
}