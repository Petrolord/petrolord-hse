import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function DocumentationHeader({ title, subtitle, lastUpdated, version }) {
  return (
    <div className="bg-[#1f1f35] border-b border-[#3a3a5a] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            {version && (
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                v{version}
              </Badge>
            )}
            <span className="flex items-center text-[#7a7a9a] text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last Updated: {lastUpdated}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{title}</h1>
          <p className="text-xl text-[#b0b0c0] leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}