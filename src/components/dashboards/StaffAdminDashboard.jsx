import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Briefcase, CalendarCheck, FileBadge } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StaffAdminDashboard() {
  const stats = [
    { label: 'Active Projects', value: '8', icon: Briefcase, color: 'text-blue-400' },
    { label: 'Total Team Size', value: '24', icon: Users, color: 'text-green-400' },
    { label: 'Upcoming Reviews', value: '3', icon: CalendarCheck, color: 'text-orange-400' },
  ];

  return (
    <DashboardLayout 
      title="Staff Administration" 
      description="Manage team assignments, projects, and administrative tasks."
      actions={<Button className="petrolord-button">Create Project</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="petrolord-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#7a7a9a]">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[#e0e0e0] mt-1">{stat.value}</h3>
            </div>
            <div className="p-4 bg-[#252541] rounded-full border border-[#3a3a5a]">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">Team Performance Overview</h3>
          <div className="space-y-4">
            {['Engineering A', 'Drilling Support', 'Logistics'].map((team, i) => (
              <div key={i} className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{team}</span>
                  <span className="text-xs text-green-400">On Track</span>
                </div>
                <div className="w-full bg-[#1a1a2e] rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${85 - (i * 10)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Tasks: 12/15</span>
                  <span>Deadline: 2 days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-[#FFC107]" />
            Recent Administrative Actions
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3 items-start pb-4 border-b border-[#3a3a5a]">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <div>
                <p className="text-[#e0e0e0]">Approved leave request for <span className="text-blue-300">Mike Ross</span></p>
                <p className="text-[#7a7a9a] text-xs">Today, 10:30 AM</p>
              </div>
            </li>
            <li className="flex gap-3 items-start pb-4 border-b border-[#3a3a5a]">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500" />
              <div>
                <p className="text-[#e0e0e0]">Project "Deepwater Horizon 2" created</p>
                <p className="text-[#7a7a9a] text-xs">Yesterday, 4:15 PM</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500" />
              <div>
                <p className="text-[#e0e0e0]">Updated shift schedule for Week 42</p>
                <p className="text-[#7a7a9a] text-xs">Oct 12, 09:00 AM</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StaffAdminDashboard;