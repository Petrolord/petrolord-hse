import React from 'react';
import { cn } from '@/lib/utils';

export default function SettingsLayout({ 
  title, 
  description, 
  icon: Icon, 
  children 
}) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {Icon && <Icon className="h-8 w-8 text-[#FFC107]" />}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          {description && (
            <p className="text-[#b0b0c0] text-lg max-w-2xl">{description}</p>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}