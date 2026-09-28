import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function DocumentationHeader({ title, subtitle, lastUpdated, version }) {
  return (
    <div className="bg-pl-surface border-b border-pl-border py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            {version && (
              <Badge variant="outline" className="font-pl-mono tabular-nums">
                v{version}
              </Badge>
            )}
            <span className="flex items-center text-pl-muted text-sm">
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              Last Updated: {lastUpdated}
            </span>
          </div>
          <h1 className="font-pl-display text-4xl md:text-5xl font-semibold text-pl-text mb-6 tracking-tight">{title}</h1>
          <p className="text-lg sm:text-xl text-pl-muted leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}