import React from 'react';
import { PETROLORD_BRANDING } from '@/components/branding/BrandingGuide';
import { format } from 'date-fns';

/**
 * ReportHeader Component
 * Standardized header for printable reports and export views.
 */
export default function ReportHeader({ title, subtitle, organizationName, generatedBy }) {
  return (
    <div className="bg-white text-slate-900 p-6 border-b-2 border-[#1e40af] mb-6 print:mb-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img 
            src={PETROLORD_BRANDING.logoUrl} 
            alt={PETROLORD_BRANDING.companyName} 
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] leading-tight">
              {PETROLORD_BRANDING.companyName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {PETROLORD_BRANDING.tagline}
            </p>
          </div>
        </div>
        
        <div className="text-right text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{organizationName || 'Organization'}</p>
          <p>Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          {generatedBy && <p>By: {generatedBy}</p>}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-lg text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}