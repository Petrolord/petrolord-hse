import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MoreHorizontal, User, Phone, MapPin } from 'lucide-react';

export default function ContractorsList({ contractors }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'suspended': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contractors.map((c) => (
          <div key={c.id} className="bg-[#252541] border border-[#3a3a5a] rounded-lg p-4 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                  {c.company_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold truncate max-w-[150px]">{c.company_name}</h3>
                  <div className="flex items-center gap-1 text-[#FFC107]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < (c.safety_rating || 0) ? 'fill-current' : 'text-[#3a3a5a]'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 text-sm text-[#b0b0c0] mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#7a7a9a]" /> {c.contact_person || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#7a7a9a]" /> {c.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#7a7a9a]" /> {c.site?.name || 'Unassigned'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#3a3a5a]">
              <Badge variant="outline" className={`border-0 ${getStatusColor(c.status)}`}>
                {c.status}
              </Badge>
              <span className="text-xs text-[#7a7a9a]">ID: {c.contractor_id}</span>
            </div>
          </div>
        ))}
        {contractors.length === 0 && (
          <div className="col-span-full p-12 text-center text-[#7a7a9a]">
            No contractors found.
          </div>
        )}
      </div>
    </div>
  );
}