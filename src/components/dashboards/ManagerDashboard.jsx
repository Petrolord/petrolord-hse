import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  BarChart3, AlertTriangle, CheckSquare, Users, 
  TrendingUp, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function ManagerDashboard() {
  return (
    <DashboardLayout 
      title="Manager Overview" 
      description="Operational insights, team performance, and incident management."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0]">Export Report</Button>
          <Button className="petrolord-button">New Task</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending Approvals', val: '5', icon: CheckSquare, color: 'text-orange-400' },
          { label: 'Open Incidents', val: '3', icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Team Active', val: '42', icon: Users, color: 'text-blue-400' },
          { label: 'Compliance Rate', val: '94%', icon: BarChart3, color: 'text-green-400' },
        ].map((stat, idx) => (
          <div key={idx} className="petrolord-card p-5 border-t-4 border-t-[#3a3a5a] hover:border-t-[#FFC107] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <span className="text-xs font-mono text-gray-500">LIVE</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.val}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Report List */}
        <div className="petrolord-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Critical Incidents (Open)
            </h3>
            <Button variant="ghost" size="sm" className="text-red-400">View All</Button>
          </div>
          
          <div className="space-y-3">
             {[
               { id: 'INC-2025-001', type: 'Equipment Failure', area: 'Zone 4 Drilling', time: '2h ago', status: 'Investigating' },
               { id: 'INC-2025-002', type: 'Near Miss', area: 'Logistics Bay', time: '5h ago', status: 'Reviewing' },
               { id: 'INC-2025-003', type: 'Spill', area: 'Pipeline A', time: '1d ago', status: 'Action Required' },
             ].map((inc, i) => (
               <div key={i} className="bg-[#2d2d4a]/50 border border-[#3a3a5a] rounded-lg p-4 flex items-center justify-between hover:bg-[#2d2d4a] cursor-pointer transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                   <div>
                     <p className="font-medium text-[#e0e0e0]">{inc.type} <span className="text-gray-500 text-xs">#{inc.id}</span></p>
                     <p className="text-xs text-[#b0b0c0]">{inc.area} • {inc.time}</p>
                   </div>
                 </div>
                 <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                   {inc.status}
                 </span>
               </div>
             ))}
          </div>
        </div>

        {/* Task Distribution / Productivity */}
        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FFC107]" />
            Task Status
          </h3>
          
          <div className="relative h-48 w-full flex items-center justify-center">
             {/* Simple CSS Chart Representation */}
             <div className="flex items-end gap-4 h-full w-full px-4">
                <div className="w-1/3 bg-blue-500/20 border border-blue-500 h-[60%] rounded-t relative group">
                  <div className="absolute -top-6 w-full text-center text-xs text-blue-400">15</div>
                  <div className="absolute bottom-2 w-full text-center text-xs text-blue-300">To Do</div>
                </div>
                <div className="w-1/3 bg-[#FFC107]/20 border border-[#FFC107] h-[80%] rounded-t relative group">
                   <div className="absolute -top-6 w-full text-center text-xs text-[#FFC107]">24</div>
                   <div className="absolute bottom-2 w-full text-center text-xs text-yellow-300">Progress</div>
                </div>
                <div className="w-1/3 bg-green-500/20 border border-green-500 h-[40%] rounded-t relative group">
                   <div className="absolute -top-6 w-full text-center text-xs text-green-400">12</div>
                   <div className="absolute bottom-2 w-full text-center text-xs text-green-300">Done</div>
                </div>
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#3a3a5a] flex justify-between text-xs text-[#7a7a9a]">
             <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> This Week</span>
             <span className="text-[#e0e0e0]">Total: 51 Tasks</span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboard;