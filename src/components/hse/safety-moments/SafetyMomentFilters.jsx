import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export default function SafetyMomentFilters({ filters, setFilters, categories = [] }) {
  const handleClear = () => {
    setFilters({ search: '', category: 'all', duration: 'all' });
  };

  return (
    <div className="w-full bg-pl-surface border-b border-pl-border p-4 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between shadow-sm z-10 sticky top-0">
      <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-pl-muted" aria-hidden="true" />
          <Input 
            placeholder="Search topics..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-8 h-10 w-full"
          />
        </div>

        {/* Category */}
        <div className="w-full md:w-56">
          <Select 
            value={filters.category} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="w-full md:w-48">
          <Select 
            value={filters.duration} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, duration: val }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Duration</SelectItem>
              <SelectItem value="5">Up to 5 min</SelectItem>
              <SelectItem value="10">5 - 10 min</SelectItem>
              <SelectItem value="15">10 - 15 min</SelectItem>
              <SelectItem value="20+">15+ min</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Clear */}
        <Button 
          variant="ghost" 
          onClick={handleClear} 
          className="px-3 h-10"
          title="Clear Filters"
        >
          <X className="h-4 w-4 mr-2" aria-hidden="true" /> Reset
        </Button>
      </div>
    </div>
  );
}