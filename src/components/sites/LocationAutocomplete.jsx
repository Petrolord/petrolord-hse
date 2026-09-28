import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Loader2, PlusCircle } from 'lucide-react';
import { siteSearchService } from '@/services/siteSearchService';
import { useHSE } from '@/context/HSEContext';

// Its only user is the Report Wizard; on the theme roles.

export default function LocationAutocomplete({ onSelect, onAddNew, placeholder = "Search for a site or location..." }) {
  const { currentOrganization } = useHSE();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // The text a pick wrote into the box. Searching for it again would reopen
  // the list the pick just closed (batch 4B), so it is not searched.
  const pickedRef = useRef(null);

  useEffect(() => {
    if (pickedRef.current !== null && query === pickedRef.current) return undefined;
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
    pickedRef.current = item.name;
    setQuery(item.name);
    setShowResults(false);
    if (onSelect) onSelect(item);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pl-muted" />
        <Input 
          className="pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { pickedRef.current = null; setQuery(e.target.value); }}
          onFocus={() => query.length > 1 && query !== pickedRef.current && setShowResults(true)}
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-pl-muted" />}
      </div>

      {showResults && query.length > 1 && (
        <div className="absolute z-50 w-full mt-1 bg-pl-raised border border-pl-border rounded-md shadow-pl-md max-h-60 overflow-auto">
          {results.length > 0 ? results.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-2 hover:bg-pl-sunken transition-colors flex items-center gap-3 border-b border-pl-border last:border-0"
              onClick={() => handleSelect(item)}
            >
              <MapPin className="h-4 w-4 text-pl-muted" />
              <div>
                <div className="text-sm text-pl-text font-medium">{item.name}</div>
                <div className="text-xs text-pl-muted">
                  {item.address || 'No address'}
                </div>
              </div>
            </button>
          )) : (
            <div className="p-4 text-center">
              <p className="text-sm text-pl-muted mb-2">No existing sites found.</p>
              {onAddNew && (
                <Button 
                  size="sm" 
                  className="w-full"
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