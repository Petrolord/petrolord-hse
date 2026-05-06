import React from 'react';
import { PlusCircle, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Workspace</h1>
        <Button className="petrolord-button gap-2">
          <PlusCircle className="h-4 w-4" />
          Report Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="petrolord-card p-6 col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">My Assigned Tasks</h3>
          <div className="text-center py-12 text-gray-500 bg-[#2d2d4a]/50 rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No open actions assigned to you.</p>
          </div>
        </div>

        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#FFC107]" />
            Announcements
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-sm text-white font-medium">New PPE Policy</p>
              <p className="text-xs text-gray-400 mt-1">Effective immediately, all staff must wear...</p>
            </div>
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm text-white font-medium">Safety Milestone</p>
              <p className="text-xs text-gray-400 mt-1">We reached 100 days incident free!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;