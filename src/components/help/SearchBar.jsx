import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar({ value = '', onChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-pl-muted" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Search guides and FAQs…"
          aria-label="Search guides and FAQs"
          className="pl-12 pr-16 sm:pr-28 h-14 rounded-full text-base sm:text-lg shadow-pl-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2 h-10 rounded-full font-semibold px-4"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <span className="absolute right-5 text-xs text-pl-muted hidden sm:block">Type to search</span>
        )}
      </div>
    </form>
  );
}
