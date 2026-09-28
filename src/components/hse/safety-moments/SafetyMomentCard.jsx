import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, ArrowRight, Eye } from 'lucide-react';

// Design family (batch 2C): the card sits on the theme roles. The category is
// a neutral tag with its name; the organisation's category colour is not
// painted, because colour in the family is kept for status.
export default function SafetyMomentCard({ moment, onClick, isSaved }) {
  return (
    <Card
      onClick={onClick}
      className="hover:border-pl-primary hover:shadow-pl-md transition-all duration-200 cursor-pointer group flex flex-col h-full overflow-hidden relative"
    >
      <CardHeader className="pb-2 relative pt-5 px-5">
        {isSaved && (
          <div className="absolute top-4 right-4 z-10" title="Saved">
            <Bookmark className="h-5 w-5 text-pl-accent-text fill-current" aria-hidden="true" />
            <span className="sr-only">Saved</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-2 pr-6">
          {moment.category?.name && (
            <Badge
              variant="neutral"
              className="font-semibold px-2 py-0.5 text-xs uppercase tracking-wide rounded-sm"
            >
              {moment.category.name}
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg font-semibold text-pl-text leading-snug line-clamp-2 group-hover:text-pl-primary-text transition-colors">
          {moment.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 flex-1 px-5">
        <p className="text-sm text-pl-muted line-clamp-3 leading-relaxed">
          {moment.one_minute_recap || moment.description || "No description available."}
        </p>
      </CardContent>

      <CardFooter className="pt-3 pb-4 px-5 border-t border-pl-border mt-auto bg-pl-sunken flex justify-between items-center">
        <div className="flex items-center gap-4 text-xs text-pl-muted font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> <span className="font-pl-mono tabular-nums">{moment.duration ?? 'n/a'}</span> min
          </span>
          {moment.shares_count > 0 && (
             <span className="flex items-center gap-1.5">
               <Eye className="h-3.5 w-3.5" aria-hidden="true" /> <span className="font-pl-mono tabular-nums">{moment.shares_count}</span>
             </span>
          )}
        </div>
        <div className="flex items-center text-pl-muted group-hover:text-pl-primary-text transition-colors text-xs font-semibold uppercase tracking-wider">
          Read <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </div>
      </CardFooter>
    </Card>
  );
}
