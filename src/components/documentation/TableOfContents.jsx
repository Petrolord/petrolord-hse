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
      <h4 className="text-sm font-semibold text-pl-text uppercase tracking-wider mb-4">Contents</h4>
      <ul className="space-y-1">
        {sections.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => scrollToSection(e, id)}
              className={cn(
                "block py-2 text-sm transition-all border-l-2 pl-4",
                activeId === id
                  ? "border-pl-primary text-pl-primary-text font-medium"
                  : "border-transparent text-pl-muted hover:text-pl-text hover:border-pl-border-strong"
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