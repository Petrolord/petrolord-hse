import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-gray-400" />
        <Input 
          type="text" 
          placeholder="How can we help you today?" 
          className="pl-12 pr-20 h-14 rounded-full bg-[#252541] border-[#3a3a5a] text-white focus:border-[#FFC107] focus:ring-[#FFC107] text-lg shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          type="submit" 
          className="absolute right-2 h-10 rounded-full bg-[#FFC107] hover:bg-[#e0a800] text-black font-bold px-6"
        >
          Search
        </Button>
      </div>
    </form>
  );
}