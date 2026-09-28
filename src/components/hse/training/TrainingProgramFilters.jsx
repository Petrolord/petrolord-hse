import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function TrainingProgramFilters({ filters, setFilters }) {
  return (
    <div className="w-full md:w-64 shrink-0 bg-pl-surface border-b md:border-b-0 md:border-r border-pl-border flex flex-col md:h-full p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-pl-text">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ category: 'all', status: 'all', search: '' })} className="h-8 px-2">Clear</Button>
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-pl-muted uppercase">Search</Label>
        <Input 
          placeholder="Search programs..." 
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-pl-muted uppercase">Category</Label>
        <Select value={filters.category} onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}>
          <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            {['all', 'Safety', 'Technical', 'Leadership', 'Compliance', 'Health'].map(c => 
              <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold text-pl-muted uppercase">Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>
    </div>
  );
}