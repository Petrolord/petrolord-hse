import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  BookOpen, CheckSquare, GraduationCap, MessageCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function InternDashboard() {
  return (
    <DashboardLayout 
      title="Intern Learning Hub" 
      description="Your space for learning, tasks, and mentorship feedback."
    >
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="petrolord-card p-6 bg-gradient-to-br from-[#252541] to-blue-900/20 border-blue-500/30">
             <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-400" />
                Learning Progress
             </h3>
             <div className="text-3xl font-bold text-white mb-1">65%</div>
             <p className="text-sm text-gray-400">Onboarding Module</p>
             <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full mt-3">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
             </div>
          </div>
          
          <div className="petrolord-card p-6">
             <div className="flex items-center gap-3 mb-2">
                <CheckSquare className="h-5 w-5 text-green-400" />
                <span className="text-gray-400">Tasks Completed</span>
             </div>
             <div className="text-3xl font-bold text-white">12/20</div>
          </div>

          <div className="petrolord-card p-6">
             <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-5 w-5 text-[#FFC107]" />
                <span className="text-gray-400">Mentor Feedback</span>
             </div>
             <div className="text-lg font-medium text-white">"Good progress on safety drills."</div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="petrolord-card p-6">
             <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">Assigned Tasks</h3>
             <div className="space-y-3">
                {[
                   { task: 'Complete HSE Module 1', status: 'Done', color: 'bg-green-500/10 text-green-400' },
                   { task: 'Review Site Map', status: 'In Progress', color: 'bg-blue-500/10 text-blue-400' },
                   { task: 'Shadow Supervisor - Shift 2', status: 'Pending', color: 'bg-gray-500/10 text-gray-400' }
                ].map((t, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-[#252541] rounded border border-[#3a3a5a]">
                      <span className="text-sm text-[#e0e0e0]">{t.task}</span>
                      <span className={`text-xs px-2 py-1 rounded ${t.color}`}>{t.status}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="petrolord-card p-6">
             <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-400" />
                Recommended Resources
             </h3>
             <ul className="space-y-3">
                <li className="p-3 hover:bg-[#2d2d4a] rounded cursor-pointer transition-colors flex gap-3">
                   <div className="h-10 w-10 bg-purple-500/20 rounded flex items-center justify-center text-purple-400 font-bold">PDF</div>
                   <div>
                      <p className="text-sm font-medium text-white">Petrolord HSE Handbook 2025</p>
                      <p className="text-xs text-gray-400">Essential Reading</p>
                   </div>
                </li>
                <li className="p-3 hover:bg-[#2d2d4a] rounded cursor-pointer transition-colors flex gap-3">
                   <div className="h-10 w-10 bg-red-500/20 rounded flex items-center justify-center text-red-400 font-bold">VID</div>
                   <div>
                      <p className="text-sm font-medium text-white">Emergency Response Training</p>
                      <p className="text-xs text-gray-400">15 min video</p>
                   </div>
                </li>
             </ul>
          </div>
       </div>
    </DashboardLayout>
  );
}

export default InternDashboard;