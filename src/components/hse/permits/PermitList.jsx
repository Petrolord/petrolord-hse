import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, MapPin, User } from 'lucide-react';
import { PermitStatusBadge, PriorityBadge } from './PermitComponents';

export default function PermitList({ permits, onViewDetails }) {
  if (!permits.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-gray-800 p-4 rounded-full mb-4">
          <FileText className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white">No Permits Found</h3>
        <p className="text-gray-400">Get started by creating a new work permit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {permits.map((permit) => (
        <Card key={permit.id} className="petrolord-card p-4 hover:bg-[var(--bg-hover)] transition-colors border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{permit.permit_number || 'DRAFT'}</span>
                <h3 className="font-semibold text-white text-lg">{permit.title}</h3>
                <PermitStatusBadge status={permit.status} />
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-2">{permit.description}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {permit.location || 'Unknown Location'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  {permit.start_date ? new Date(permit.start_date).toLocaleDateString() : 'TBD'}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" /> 
                  {permit.requester?.raw_user_meta_data?.full_name || permit.requester?.email || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between gap-2 min-w-[120px]">
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Priority</span>
                <PriorityBadge priority={permit.priority} />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(permit)}>
                <Eye className="mr-2 h-3 w-3" /> View
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Helper icon
function FileText(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  )
}