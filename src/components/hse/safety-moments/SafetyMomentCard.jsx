import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, ArrowRight, Eye } from 'lucide-react';

export default function SafetyMomentCard({ moment, onClick, isSaved }) {
  // Petrolord accent colors for card hover effects
  const accentColor = moment.category?.color || '#3a3a5a';

  return (
    <Card 
      onClick={onClick}
      className="bg-[#252541] border-[#3a3a5a] hover:border-[#FFC107]/50 hover:shadow-lg hover:shadow-[#FFC107]/5 transition-all duration-200 cursor-pointer group flex flex-col h-full overflow-hidden relative"
    >
      {/* Category Color Strip */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      
      <CardHeader className="pb-2 relative pt-5 px-5">
        {isSaved && (
          <div className="absolute top-4 right-4 z-10">
            <Bookmark className="h-5 w-5 text-[#FFC107] fill-current drop-shadow-sm" />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2 pr-6">
          <Badge 
            variant="outline" 
            className="border-none font-semibold px-2 py-0.5 text-xs uppercase tracking-wide rounded-sm"
            style={{ 
              backgroundColor: `${accentColor}15`, 
              color: accentColor 
            }}
          >
            {moment.category?.name}
          </Badge>
        </div>
        
        <CardTitle className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-[#FFC107] transition-colors">
          {moment.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4 flex-1 px-5">
        <p className="text-sm text-[#b0b0c0] line-clamp-3 leading-relaxed">
          {moment.one_minute_recap || moment.description || "No description available."}
        </p>
      </CardContent>
      
      <CardFooter className="pt-3 pb-4 px-5 border-t border-[#3a3a5a]/50 mt-auto bg-[#1f1f35]/30 flex justify-between items-center">
        <div className="flex items-center gap-4 text-xs text-[#7a7a9a] font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {moment.duration} min
          </span>
          {moment.shares_count > 0 && (
             <span className="flex items-center gap-1.5">
               <Eye className="h-3.5 w-3.5" /> {moment.shares_count}
             </span>
          )}
        </div>
        <div className="flex items-center text-[#7a7a9a] group-hover:text-[#FFC107] transition-colors text-xs font-semibold uppercase tracking-wider">
          Read <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardFooter>
    </Card>
  );
}