import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function TeamFilters({ filters, setFilters, activeTab }) {
  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'all', search: '', level: 'all', type: 'all' })} className="h-8 px-2 text-[#7a7a9a] hover:text-white">Clear</Button>
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Search</Label>
        <Input 
          placeholder="Search..." 
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
            {activeTab === 'projects' && <SelectItem value="Planning">Planning</SelectItem>}
            {activeTab === 'projects' && <SelectItem value="In Progress">In Progress</SelectItem>}
            {activeTab === 'projects' && <SelectItem value="Completed">Completed</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {activeTab === 'roles' && (
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase">Level</Label>
          <Select value={filters.level || 'all'} onValueChange={(val) => setFilters(prev => ({ ...prev, level: val }))}>
            <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] h-9"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Mid">Mid</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}