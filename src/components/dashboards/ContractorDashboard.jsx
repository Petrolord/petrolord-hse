import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ClipboardCheck, Clock, FileText, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function ContractorDashboard() {
  return (
    <DashboardLayout 
      title="Contractor Portal" 
      description="Manage your assigned tasks, submit timesheets, and view safety requirements."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stats */}
        <div className="petrolord-card p-6 flex items-center gap-4">
           <div className="p-3 bg-blue-500/20 rounded-full"><ClipboardCheck className="h-6 w-6 text-blue-400" /></div>
           <div>
             <p className="text-2xl font-bold text-white">4</p>
             <p className="text-sm text-gray-400">Assigned Tasks</p>
           </div>
        </div>
        <div className="petrolord-card p-6 flex items-center gap-4">
           <div className="p-3 bg-green-500/20 rounded-full"><Clock className="h-6 w-6 text-green-400" /></div>
           <div>
             <p className="text-2xl font-bold text-white">38h</p>
             <p className="text-sm text-gray-400">Hours This Week</p>
           </div>
        </div>
        <div className="petrolord-card p-6 flex items-center gap-4">
           <div className="p-3 bg-[#FFC107]/20 rounded-full"><AlertTriangle className="h-6 w-6 text-[#FFC107]" /></div>
           <div>
             <p className="text-2xl font-bold text-white">100%</p>
             <p className="text-sm text-gray-400">Safety Compliance</p>
           </div>
        </div>

        {/* Tasks List */}
        <div className="petrolord-card p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">My Tasks</h3>
          <div className="space-y-3">
             {[
               { title: 'Weld Inspection - Unit 4', deadline: 'Today', priority: 'High', status: 'In Progress' },
               { title: 'Site Cleanup - Zone B', deadline: 'Tomorrow', priority: 'Medium', status: 'Pending' },
               { title: 'Submit Safety Observation', deadline: 'Fri', priority: 'Low', status: 'Pending' }
             ].map((task, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-[#252541] rounded-lg border border-[#3a3a5a]">
                 <div>
                   <p className="font-medium text-[#e0e0e0]">{task.title}</p>
                   <p className="text-xs text-[#7a7a9a]">Due: {task.deadline} • Priority: {task.priority}</p>
                 </div>
                 <Button size="sm" variant={task.status === 'In Progress' ? 'default' : 'secondary'} className={task.status === 'In Progress' ? 'petrolord-button' : ''}>
                   {task.status}
                 </Button>
               </div>
             ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="petrolord-card p-6">
            <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" /> Log Hours
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Submit Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" /> Report Hazard
              </Button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ContractorDashboard;