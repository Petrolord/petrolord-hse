import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, MessageSquare, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { id: 'open', label: 'Open', color: 'bg-blue-500' },
  { id: 'under_review', label: 'Under Review', color: 'bg-yellow-500' },
  { id: 'closed', label: 'Closed', color: 'bg-green-500' }
];

const severityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function ObservationsKanban({ observations, onViewDetails, onUpdateStatus }) {
  
  const handleDragStart = (e, obsId) => {
    e.dataTransfer.setData("text/plain", obsId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const obsId = e.dataTransfer.getData("text/plain");
    if (obsId) {
      onUpdateStatus(obsId, status);
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 p-4">
      {COLUMNS.map(col => {
        const colObservations = observations.filter(o => o.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className="flex-1 min-w-[320px] bg-[#252541]/30 rounded-xl border border-[#3a3a5a] flex flex-col max-h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-4 border-b border-[#3a3a5a] flex items-center justify-between bg-[#252541] rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${col.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                <h3 className="font-semibold text-[#e0e0e0]">{col.label}</h3>
              </div>
              <Badge variant="secondary" className="bg-[#1a1a2e] text-[#b0b0c0] font-mono">{colObservations.length}</Badge>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-[#3a3a5a]">
              {colObservations.map(obs => (
                <motion.div
                  key={obs.id}
                  layoutId={obs.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, obs.id)}
                  onClick={() => onViewDetails(obs)}
                  className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg p-4 cursor-grab active:cursor-grabbing hover:border-[#FFC107]/50 hover:shadow-lg transition-all group relative"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-[#7a7a9a] bg-[#252541] px-1 rounded">{obs.reference_code}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${severityColors[obs.severity]}`}>
                      {obs.severity}
                    </Badge>
                  </div>
                  
                  <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 leading-snug">{obs.title}</h4>
                  
                  <div className="flex items-center gap-2 text-xs text-[#7a7a9a] mb-3">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{obs.site?.name || 'Unknown Location'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#3a3a5a]/50">
                    <div className="flex items-center gap-2" title={obs.reporter?.email}>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-[#2d2d4a] text-[9px] text-white">
                          {obs.reporter?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-[#7a7a9a] truncate max-w-[80px]">
                        {obs.reporter?.email?.split('@')[0]}
                      </span>
                    </div>
                    {obs.meta_data?.comments?.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#7a7a9a]">
                        <MessageSquare className="h-3 w-3" /> {obs.meta_data.comments.length}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {colObservations.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-[#3a3a5a] rounded-lg text-[#7a7a9a] text-sm italic">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}