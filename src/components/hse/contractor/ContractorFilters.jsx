import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ContractorFilters({ filters, setFilters }) {
  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'all', safetyRating: 'all', tier: 'all', search: '' })} className="h-8 px-2 text-[#7a7a9a] hover:text-white">Clear</Button>
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Search</Label>
        <Input 
          placeholder="Company name..." 
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="bg-[#1a1a2e] border-[#3a3a5a] text-white h-9"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Tier</Label>
        <Select value={filters.tier} onValueChange={(val) => setFilters(prev => ({ ...prev, tier: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Tier 1">Tier 1</SelectItem>
            <SelectItem value="Tier 2">Tier 2</SelectItem>
            <SelectItem value="Tier 3">Tier 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Safety Rating</Label>
        <Select value={filters.safetyRating} onValueChange={(val) => setFilters(prev => ({ ...prev, safetyRating: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}