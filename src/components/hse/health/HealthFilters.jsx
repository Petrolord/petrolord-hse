import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function HealthFilters({ filters, setFilters, users }) {
  const clearAll = () => {
    setFilters({ recordType: 'all', userId: 'all', search: '' });
  };

  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-[#7a7a9a] hover:text-white">
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Record Type</Label>
        <Select value={filters.recordType} onValueChange={(val) => setFilters(prev => ({ ...prev, recordType: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Fitness to Work">Fitness to Work</SelectItem>
            <SelectItem value="Medical Incident">Medical Incident</SelectItem>
            <SelectItem value="Vaccination">Vaccination</SelectItem>
            <SelectItem value="Exposure">Exposure</SelectItem>
            <SelectItem value="Clinic Visit">Clinic Visit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-[#3a3a5a]" />

      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Employee</Label>
        <Select value={filters.userId} onValueChange={(val) => setFilters(prev => ({ ...prev, userId: val }))}>
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="all">All Employees</SelectItem>
            {users?.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.raw_user_meta_data?.full_name || u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}