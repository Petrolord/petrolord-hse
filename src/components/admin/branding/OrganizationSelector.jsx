import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Check } from 'lucide-react';

export default function OrganizationSelector({ organizations, selectedIds, onSelectionChange }) {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredOrgs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredOrgs.map(o => o.id));
    }
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === "all" || org.subscription_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] border-r border-[#3a3a5a]">
      <div className="p-4 border-b border-[#3a3a5a] space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search organizations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-[#252541] border-[#3a3a5a] text-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'premium', 'enterprise', 'free'].map(tier => (
            <Badge 
              key={tier}
              variant={filterTier === tier ? "default" : "outline"}
              className={`cursor-pointer capitalize ${filterTier === tier ? 'bg-blue-600' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setFilterTier(tier)}
            >
              {tier}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="select-all" 
              checked={filteredOrgs.length > 0 && selectedIds.length === filteredOrgs.length}
              onCheckedChange={toggleAll}
            />
            <label htmlFor="select-all" className="text-sm text-gray-400 cursor-pointer select-none">
              Select All ({filteredOrgs.length})
            </label>
          </div>
          <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredOrgs.map(org => {
            const isSelected = selectedIds.includes(org.id);
            const branding = org.organization_branding?.[0];
            return (
              <div 
                key={org.id}
                onClick={() => toggleSelection(org.id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border
                  ${isSelected ? 'bg-blue-900/20 border-blue-500/50' : 'hover:bg-[#252541] border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Checkbox checked={isSelected} className="border-gray-500 data-[state=checked]:border-blue-500" />
                  <div className="truncate">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-100' : 'text-gray-300'}`}>
                      {org.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{org.subscription_tier}</span>
                      {branding?.is_branding_enabled && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-green-900/30 text-green-400 border-0">
                          Branded
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />}
              </div>
            );
          })}
          {filteredOrgs.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No organizations found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}