import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RiskFilters({ filters, setFilters }) {
  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ category: 'all', status: 'all', likelihood: 'all' })} className="h-8 px-2 text-[#7a7a9a] hover:text-white">
          Clear
        </Button>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Category</Label>
        <Select value={filters.category} onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Strategic">Strategic</SelectItem>
            <SelectItem value="Operational">Operational</SelectItem>
            <SelectItem value="Financial">Financial</SelectItem>
            <SelectItem value="Compliance">Compliance</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Mitigated">Mitigated</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}