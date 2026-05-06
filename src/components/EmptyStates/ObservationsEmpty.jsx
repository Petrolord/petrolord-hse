import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ObservationsEmpty({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-[#3a3a5a] rounded-lg bg-[#1f1f35]/50 m-4">
      <div className="bg-[#252541] p-4 rounded-full mb-4">
        <Eye className="h-8 w-8 text-[#FFC107]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Observations Yet</h3>
      <p className="text-[#b0b0c0] max-w-sm mb-6">
        Create your first observation to start tracking safety behaviors and hazard identifications across your organization.
      </p>
      <Button 
        onClick={onCreate} 
        className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Observation
      </Button>
    </div>
  );
}