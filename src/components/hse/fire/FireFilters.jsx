import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FireFilters({ filters, setFilters }) {
  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ type: 'all' })} className="h-8 px-2 text-[#7a7a9a] hover:text-white">Clear</Button>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Type</Label>
        <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Fire Inspection">Inspection</SelectItem>
            <SelectItem value="Fire Hazard">Hazard</SelectItem>
            <SelectItem value="Fire Incident">Incident</SelectItem>
            <SelectItem value="Fire Training">Training</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}