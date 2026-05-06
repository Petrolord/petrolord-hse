import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SetupRequiredModal({ isOpen, onStartSetup }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <div className="text-center py-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 mb-6">
            <Building2 className="h-10 w-10 text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Organization Setup Required</h2>
          <p className="text-[#b0b0c0] mb-8 max-w-sm mx-auto">
            Before your team can start submitting safety observations, we need to configure your organization structure.
          </p>

          <div className="bg-[#252541] p-6 rounded-lg mb-8 text-left border border-[#3a3a5a]">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Setup Includes:</h3>
            <ul className="space-y-3 text-sm text-[#b0b0c0]">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Defining Departments & Cost Centers</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Creating Sites & Locations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Standardizing Job Roles</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Assigning Key Safety Personnel</li>
            </ul>
          </div>

          <Button 
            onClick={onStartSetup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-lg shadow-blue-900/20"
          >
            Start Setup Wizard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}