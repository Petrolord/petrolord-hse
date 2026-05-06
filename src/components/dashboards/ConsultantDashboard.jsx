import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Briefcase, FileCheck, MessageSquare, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function ConsultantDashboard() {
  return (
    <DashboardLayout 
      title="Consultant Workspace" 
      description="Track project deliverables, consultation requests, and expertise engagements."
      actions={<Button className="petrolord-button">Upload Deliverable</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Projects', val: '2', icon: Briefcase, color: 'text-purple-400' },
          { label: 'Deliverables Due', val: '1', icon: FileCheck, color: 'text-red-400' },
          { label: 'Consultations', val: '5', icon: MessageSquare, color: 'text-blue-400' },
          { label: 'Rating', val: '4.9', icon: Star, color: 'text-[#FFC107]' },
        ].map((stat, i) => (
           <div key={i} className="petrolord-card p-4 text-center hover:bg-[#252541] transition-colors">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-white">{stat.val}</div>
              <div className="text-xs text-gray-400 uppercase">{stat.label}</div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 petrolord-card p-6">
           <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">Project Deliverables</h3>
           <div className="space-y-4">
              <div className="p-4 bg-[#252541] rounded-lg border-l-4 border-l-[#FFC107]">
                 <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-bold text-[#e0e0e0]">Environmental Impact Assessment</h4>
                       <p className="text-sm text-gray-400">Project: Deep Sea Exploration Block 4</p>
                    </div>
                    <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] px-2 py-1 rounded">Draft Review</span>
                 </div>
                 <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary">View Feedback</Button>
                    <Button size="sm" className="petrolord-button">Upload Revision</Button>
                 </div>
              </div>

              <div className="p-4 bg-[#252541] rounded-lg border-l-4 border-l-green-500">
                 <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-bold text-[#e0e0e0]">Safety Protocol Audit</h4>
                       <p className="text-sm text-gray-400">Project: Refinery Modernization</p>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Approved</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="petrolord-card p-6">
           <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">Upcoming Consultations</h3>
           <ul className="space-y-4">
              {[
                { name: 'Dr. Alan Grant', topic: 'Site Geology', time: 'Tomorrow, 10:00 AM' },
                { name: 'Sarah Connor', topic: 'Risk Mitigation', time: 'Wed, 2:00 PM' }
              ].map((c, i) => (
                <li key={i} className="flex gap-3 items-center p-3 hover:bg-[#2d2d4a] rounded-lg transition-colors cursor-pointer">
                   <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {c.name.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.topic}</p>
                      <p className="text-xs text-[#FFC107] mt-0.5">{c.time}</p>
                   </div>
                </li>
              ))}
           </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ConsultantDashboard;