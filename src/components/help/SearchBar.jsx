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
        <Search className="absolute left-4 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search guides and FAQs…"
          className="pl-12 pr-24 h-14 rounded-full bg-[#252541] border-[#3a3a5a] text-white focus:border-[#FFC107] focus:ring-[#FFC107] text-lg shadow-lg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <Button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 h-10 rounded-full bg-[#3a3a5a] hover:bg-[#4a4a6a] text-white font-bold px-5"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <span className="absolute right-5 text-xs text-gray-500 hidden sm:block">Type to search</span>
        )}
      </div>
    </form>
  );
}
