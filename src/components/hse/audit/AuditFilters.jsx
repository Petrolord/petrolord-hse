import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditFilters({ filters, setFilters }) {
  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'all', type: 'all' })} className="h-8 px-2 text-[#7a7a9a] hover:text-white">Clear</Button>
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Type</Label>
        <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Internal">Internal</SelectItem>
            <SelectItem value="Contractor">Contractor</SelectItem>
            <SelectItem value="Site">Site</SelectItem>
            <SelectItem value="System">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}