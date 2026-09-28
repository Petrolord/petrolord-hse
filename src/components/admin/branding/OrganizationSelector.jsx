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
    <div className="flex flex-col h-full bg-pl-surface">
      <div className="p-4 border-b border-pl-border space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-pl-muted" aria-hidden="true" />
          <Input 
            placeholder="Search organizations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search organizations"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'premium', 'enterprise', 'free'].map(tier => (
            <Badge 
              key={tier}
              variant={filterTier === tier ? "selected" : "neutral"}
              className="cursor-pointer capitalize hover:text-pl-text"
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
            <label htmlFor="select-all" className="text-sm text-pl-muted cursor-pointer select-none">
              Select All ({filteredOrgs.length})
            </label>
          </div>
          <span className="text-xs text-pl-muted"><span className="font-pl-mono tabular-nums">{selectedIds.length}</span> selected</span>
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
                  ${isSelected ? 'bg-pl-primary/10 border-pl-primary/50' : 'hover:bg-pl-sunken border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Checkbox checked={isSelected} aria-label={`Select ${org.name}`} />
                  <div className="truncate">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-pl-primary-text' : 'text-pl-text'}`}>
                      {org.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-pl-muted">
                      <span className="capitalize">{org.subscription_tier}</span>
                      {branding?.is_branding_enabled && (
                        <Badge variant="success" className="h-4 px-1 text-[10px]">
                          Branded
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-pl-primary-text flex-shrink-0" aria-hidden="true" />}
              </div>
            );
          })}
          {filteredOrgs.length === 0 && (
            <div className="p-8 text-center text-pl-muted text-sm">
              No organizations found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}