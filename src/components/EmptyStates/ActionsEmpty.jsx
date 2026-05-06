import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActionsEmpty({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-[#3a3a5a] rounded-lg bg-[#1f1f35]/50 m-4 min-h-[400px]">
      <div className="bg-[#252541] p-4 rounded-full mb-4">
        <CheckSquare className="h-8 w-8 text-emerald-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Actions Assigned</h3>
      <p className="text-[#b0b0c0] max-w-sm mb-6">
        There are currently no corrective actions or tasks in the tracker. Actions will appear here when assigned from reports.
      </p>
      {/* CTA for manual creation matching screenshot */}
      {onCreate && (
        <Button 
          onClick={onCreate} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Action
        </Button>
      )}
    </div>
  );
}