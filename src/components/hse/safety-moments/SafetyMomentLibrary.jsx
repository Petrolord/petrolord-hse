import React from 'react';
import SafetyMomentCard from './SafetyMomentCard';
import { Loader2 } from 'lucide-react';
import { accountEmpty } from '@/components/account/accountChrome';

export default function SafetyMomentLibrary({ moments, loading, onSelect, savedIds }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 text-pl-muted animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className={`m-4 sm:m-6 flex h-64 flex-col items-center justify-center ${accountEmpty}`}>
        <p className="text-lg font-medium text-pl-text">No safety moments found.</p>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {moments.map(moment => (
        <SafetyMomentCard 
          key={moment.id} 
          moment={moment} 
          onClick={() => onSelect(moment)}
          isSaved={savedIds.includes(moment.id)}
        />
      ))}
    </div>
  );
}