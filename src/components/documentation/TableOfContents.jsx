import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function TableOfContents({ sections }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto pr-4 hidden lg:block">
      <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contents</h4>
      <ul className="space-y-1">
        {sections.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => scrollToSection(e, id)}
              className={cn(
                "block py-2 text-sm transition-all border-l-2 pl-4",
                activeId === id
                  ? "border-[#FFC107] text-[#FFC107] font-medium"
                  : "border-transparent text-[#7a7a9a] hover:text-[#b0b0c0] hover:border-[#3a3a5a]"
              )}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}