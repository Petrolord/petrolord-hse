import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function ActionFilters({ filters, setFilters, users }) {
  
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
      priority: [],
      assigned_to: 'all',
      isOverdue: false,
      dateRange: null
    });
  };

  return (
    <div className="w-64 bg-[#1a1a2e] border-r border-[#3a3a5a] flex flex-col h-full overflow-y-auto pt-4">
      <div className="px-6 mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-[#7a7a9a] hover:text-white text-xs">
          Clear All
        </Button>
      </div>

      <div className="px-6 space-y-8">
        {/* Status */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#7a7a9a] uppercase tracking-wider">STATUS</Label>
          <div className="space-y-3">
            {['open', 'in_progress', 'pending_approval', 'closed'].map(status => (
              <div key={status} className="flex items-center space-x-3">
                <Checkbox 
                  id={`status-${status}`} 
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleCheckboxChange('status', status)}
                  className="border-[#3a3a5a] bg-[#252541] data-[state=checked]:bg-[#3a3a5a] data-[state=checked]:text-white data-[state=checked]:border-[#FFC107]"
                />
                <label htmlFor={`status-${status}`} className="text-sm text-[#b0b0c0] capitalize cursor-pointer select-none font-medium">
                  {status.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#7a7a9a] uppercase tracking-wider">PRIORITY</Label>
          <div className="space-y-3">
            {['low', 'medium', 'high', 'critical'].map(p => (
              <div key={p} className="flex items-center space-x-3">
                <Checkbox 
                  id={`prio-${p}`} 
                  checked={filters.priority.includes(p)}
                  onCheckedChange={() => handleCheckboxChange('priority', p)}
                  className="border-[#3a3a5a] bg-[#252541] data-[state=checked]:bg-[#3a3a5a] data-[state=checked]:text-white data-[state=checked]:border-[#FFC107]"
                />
                <label htmlFor={`prio-${p}`} className="text-sm text-[#b0b0c0] capitalize cursor-pointer select-none font-medium">{p}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned To */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#7a7a9a] uppercase tracking-wider">ASSIGNED TO</Label>
          <Select value={filters.assigned_to} onValueChange={(val) => setFilters(prev => ({...prev, assigned_to: val}))}>
            <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-[#e0e0e0] h-10">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
              <SelectItem value="all">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.raw_user_meta_data?.full_name || user.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SLA */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-[#7a7a9a] uppercase tracking-wider">SLA</Label>
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="overdue" 
              checked={filters.isOverdue}
              onCheckedChange={(checked) => setFilters(prev => ({...prev, isOverdue: checked}))}
              className="border-[#3a3a5a] bg-[#252541] data-[state=checked]:bg-[#3a3a5a] data-[state=checked]:text-white data-[state=checked]:border-[#FFC107]"
            />
            <label htmlFor="overdue" className="text-sm text-[#b0b0c0] cursor-pointer select-none font-medium">Overdue Only</label>
          </div>
        </div>
      </div>
    </div>
  );
}