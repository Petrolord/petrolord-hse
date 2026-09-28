import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditFilters({ filters, setFilters }) {
  return (
    <div className="w-full md:w-64 shrink-0 bg-pl-surface border-b md:border-b-0 md:border-r border-pl-border flex flex-col md:h-full p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-pl-text">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'all', type: 'all' })} className="h-8 px-2">Clear</Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-pl-muted uppercase">Type</Label>
        <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
          <SelectTrigger className="h-9"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Internal">Internal</SelectItem>
            <SelectItem value="Contractor">Contractor</SelectItem>
            <SelectItem value="Site">Site</SelectItem>
            <SelectItem value="System">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold text-pl-muted uppercase">Status</Label>
        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>
    </div>
  );
}