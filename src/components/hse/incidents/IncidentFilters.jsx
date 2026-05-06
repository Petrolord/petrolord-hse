import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function IncidentFilters({ filters, setFilters, sites, departments, users }) {
  
  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearAll = () => {
    setFilters({
      search: '',
      status: [],
      severity: [],
      site_id: 'all',
      department_id: 'all',
      assigned_to: 'all',
      dateRange: null
    });
  };

  return (
    <div className="w-64 bg-[#252541] border-r border-[#3a3a5a] flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-[#3a3a5a] flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-[#7a7a9a] hover:text-white">
          Clear
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Status */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Status</Label>
          <div className="space-y-2">
            {['open', 'investigation', 'closed'].map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox 
                  id={`status-${status}`} 
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleCheckboxChange('status', status)}
                  className="border-[#3a3a5a] data-[state=checked]:bg-[#FFC107] data-[state=checked]:text-black"
                />
                <label htmlFor={`status-${status}`} className="text-sm text-[#e0e0e0] capitalize cursor-pointer select-none">
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-[#3a3a5a]" />

        {/* Severity */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Severity</Label>
          <div className="space-y-2">
            {['low', 'medium', 'high', 'critical'].map(severity => (
              <div key={severity} className="flex items-center space-x-2">
                <Checkbox 
                  id={`sev-${severity}`} 
                  checked={filters.severity.includes(severity)}
                  onCheckedChange={() => handleCheckboxChange('severity', severity)}
                  className="border-[#3a3a5a] data-[state=checked]:bg-[#FFC107] data-[state=checked]:text-black"
                />
                <label htmlFor={`sev-${severity}`} className="text-sm text-[#e0e0e0] capitalize cursor-pointer select-none">
                  {severity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-[#3a3a5a]" />

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Location</Label>
          <Select value={filters.site_id} onValueChange={(val) => setFilters(prev => ({...prev, site_id: val}))}>
            <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Assigned Investigator</Label>
          <Select value={filters.assigned_to} onValueChange={(val) => setFilters(prev => ({...prev, assigned_to: val}))}>
            <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectItem value="all">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.raw_user_meta_data?.full_name || user.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#b0b0c0] uppercase tracking-wider">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
               <span className="text-[10px] text-[#7a7a9a]">From</span>
               <input 
                 type="date" 
                 className="w-full bg-[#1a1a2e] border border-[#3a3a5a] rounded px-2 py-1 text-xs text-[#e0e0e0]" 
                 onChange={(e) => setFilters(prev => ({...prev, dateRange: {...prev.dateRange, from: e.target.value ? new Date(e.target.value) : null}}))}
               />
             </div>
             <div className="space-y-1">
               <span className="text-[10px] text-[#7a7a9a]">To</span>
               <input 
                 type="date" 
                 className="w-full bg-[#1a1a2e] border border-[#3a3a5a] rounded px-2 py-1 text-xs text-[#e0e0e0]" 
                 onChange={(e) => setFilters(prev => ({...prev, dateRange: {...prev.dateRange, to: e.target.value ? new Date(e.target.value) : null}}))}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}