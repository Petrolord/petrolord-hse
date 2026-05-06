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
    if (value === true) return <Check className="h-5 w-5 text-emerald-400 mx-auto" />;
    if (value === false) return <Minus className="h-5 w-5 text-[#3a3a5a] mx-auto" />;
    return <span className="text-white text-sm font-medium">{value}</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Detailed Feature Comparison</h2>
        <p className="text-[#b0b0c0]">Explore what's included in every plan.</p>
      </div>

      <div className="rounded-xl border border-[#3a3a5a] bg-[#1f1f35] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#151525] sticky top-0 z-30">
            <TableRow className="border-[#3a3a5a] hover:bg-transparent">
              <TableHead className="w-[300px] py-6 pl-6 text-[#b0b0c0] font-bold uppercase tracking-wider">Features</TableHead>
              <TableHead className="text-center w-[200px] text-white font-bold text-lg">
                Free
              </TableHead>
              <TableHead className="text-center w-[200px] relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-[#FFC107]"></div>
                <span className="text-[#FFC107] font-bold text-lg block pt-1">Professional</span>
              </TableHead>
              <TableHead className="text-center w-[200px] text-white font-bold text-lg">
                Enterprise
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {featureCategories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header */}
                <TableRow 
                  className="bg-[#252541]/50 border-[#3a3a5a] cursor-pointer hover:bg-[#252541]"
                  onClick={() => toggleCategory(category.id)}
                >
                  <TableCell colSpan={4} className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      {openCategories.includes(category.id) 
                        ? <ChevronDown className="h-4 w-4 text-[#FFC107]" /> 
                        : <ChevronRight className="h-4 w-4 text-[#b0b0c0]" />}
                      
                      <div className="flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-[#FFC107]" />
                        <span className="font-bold text-white text-base">{category.title}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Features */}
                {openCategories.includes(category.id) && category.features.map((feature, idx) => (
                  <TableRow key={`${category.id}-${idx}`} className="border-[#3a3a5a] hover:bg-[#252541]/30 transition-colors">
                    <TableCell className="pl-10 py-4 text-[#e0e0e0]">
                      <div className="flex items-center gap-2">
                        {feature.name}
                        {['Advanced', 'Custom'].some(kw => typeof feature.ent === 'string' && feature.ent.includes(kw)) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-[#7a7a9a]" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Advanced capability for complex workflows.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4 bg-[#1a1a2e]/20">{renderValue(feature.free)}</TableCell>
                    <TableCell className="text-center py-4 bg-[#FFC107]/5 font-medium">{renderValue(feature.pro)}</TableCell>
                    <TableCell className="text-center py-4 bg-[#1a1a2e]/20">{renderValue(feature.ent)}</TableCell>
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