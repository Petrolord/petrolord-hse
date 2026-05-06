import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Loader2, PlusCircle } from 'lucide-react';
import { siteSearchService } from '@/services/siteSearchService';
import { useHSE } from '@/context/HSEContext';

export default function LocationAutocomplete({ onSelect, onAddNew, placeholder = "Search for a site or location..." }) {
  const { currentOrganization } = useHSE();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const data = await siteSearchService.searchSites(currentOrganization.id, query);
      setResults(data || []);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowResults(false);
    if (onSelect) onSelect(item);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          className="pl-9 bg-[#1a1a2e] border-[#3a3a5a] text-white"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowResults(true)}
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
      </div>

      {showResults && query.length > 1 && (
        <div className="absolute z-50 w-full mt-1 bg-[#252541] border border-[#3a3a5a] rounded-md shadow-lg max-h-60 overflow-auto">
          {results.length > 0 ? results.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-2 hover:bg-[#3a3a5a] transition-colors flex items-center gap-3 border-b border-[#3a3a5a]/50 last:border-0"
              onClick={() => handleSelect(item)}
            >
              <MapPin className="h-4 w-4 text-[#FFC107]" />
              <div>
                <div className="text-sm text-white font-medium">{item.name}</div>
                <div className="text-xs text-gray-400">
                  {item.address || 'No address'}
                </div>
              </div>
            </button>
          )) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-2">No existing sites found.</p>
              {onAddNew && (
                <Button 
                  size="sm" 
                  className="bg-[#FFC107] text-black w-full"
                  onClick={() => {
                    onAddNew();
                    setShowResults(false);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Site
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}