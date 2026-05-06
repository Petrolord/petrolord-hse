import React from 'react';

export default function DocumentationSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-32 mb-16 border-b border-[#3a3a5a]/50 pb-12 last:border-0">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center group">
        <span className="text-[#FFC107] mr-2 opacity-50 group-hover:opacity-100 transition-opacity">#</span>
        {title}
      </h2>
      <div className="text-[#b0b0c0] leading-relaxed space-y-4 text-lg">
        {children}
      </div>
    </section>
  );
}