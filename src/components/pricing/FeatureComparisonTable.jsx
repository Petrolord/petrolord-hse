import React, { useState } from 'react';
import { featureCategories } from './data';
import { Check, X, Minus, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeatureComparisonTable() {
  const [openCategories, setOpenCategories] = useState(
    featureCategories.map(c => c.id) // All open by default
  );

  const toggleCategory = (id) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const renderValue = (value) => {
    // The icons carry a word for screen readers: colour and shape alone never state inclusion.
    if (value === true) return <><Check className="h-5 w-5 text-pl-primary-text mx-auto" aria-hidden="true" /><span className="sr-only">Included</span></>;
    if (value === false) return <><Minus className="h-5 w-5 text-pl-muted mx-auto" aria-hidden="true" /><span className="sr-only">Not included</span></>;
    return <span className="text-pl-text text-sm font-medium">{value}</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="font-pl-display text-3xl font-semibold text-pl-text mb-4">Detailed Feature Comparison</h2>
        <p className="text-pl-muted">Explore what's included in every plan.</p>
      </div>

      <div className="rounded-xl border border-pl-border bg-pl-surface overflow-hidden shadow-pl-md">
        <p className="md:hidden text-center text-xs text-pl-muted py-2 border-b border-pl-border">Swipe sideways to compare plans</p>
        <Table className="min-w-[640px]">
          <TableHeader className="bg-pl-sunken sticky top-0 z-30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] py-6 pl-6 text-pl-muted font-bold uppercase tracking-wider">Features</TableHead>
              <TableHead className="text-center w-[200px] text-pl-text font-bold text-lg">
                Free
              </TableHead>
              <TableHead className="text-center w-[200px] relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-pl-accent"></div>
                <span className="text-pl-accent-text font-bold text-lg block pt-1">Professional</span>
              </TableHead>
              <TableHead className="text-center w-[200px] text-pl-text font-bold text-lg">
                Enterprise
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {featureCategories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header */}
                <TableRow 
                  className="bg-pl-sunken/60 cursor-pointer hover:bg-pl-sunken"
                  onClick={() => toggleCategory(category.id)}
                >
                  <TableCell colSpan={4} className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      {openCategories.includes(category.id) 
                        ? <ChevronDown className="h-4 w-4 text-pl-accent-text" aria-hidden="true" />
                        : <ChevronRight className="h-4 w-4 text-pl-muted" aria-hidden="true" />}
                      
                      <div className="flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-pl-accent-text" aria-hidden="true" />
                        <span className="font-bold text-pl-text text-base">{category.title}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Features */}
                {openCategories.includes(category.id) && category.features.map((feature, idx) => (
                  <TableRow key={`${category.id}-${idx}`} className="hover:bg-pl-sunken/40 transition-colors">
                    <TableCell className="pl-10 py-4 text-pl-text">
                      <div className="flex items-center gap-2">
                        {feature.name}
                        {['Advanced', 'Custom'].some(kw => typeof feature.ent === 'string' && feature.ent.includes(kw)) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-pl-muted" aria-label="More about this feature" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Advanced capability for complex workflows.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">{renderValue(feature.free)}</TableCell>
                    <TableCell className="text-center py-4 bg-pl-accent/5 font-medium">{renderValue(feature.pro)}</TableCell>
                    <TableCell className="text-center py-4">{renderValue(feature.ent)}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}