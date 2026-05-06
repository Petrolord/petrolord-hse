import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ClipboardList, HardHat, AlertCircle, MapPin, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function SupervisorDashboard() {
  return (
    <DashboardLayout 
      title="Field Supervisor" 
      description="Monitor active permits, crew status, and daily site operations."
      actions={<Button className="petrolord-button">Log Daily Report</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Permits Card */}
        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-400" />
            Active Permits (PTW)
          </h3>
          <ul className="space-y-3">
            {[
              { id: 'PTW-882', task: 'Hot Work - Pipeline Welding', loc: 'Area B4', time: '08:00 - 16:00' },
              { id: 'PTW-885', task: 'Confined Space Entry', loc: 'Tank 3', time: '09:30 - 14:00' },
              { id: 'PTW-890', task: 'Electrical Maintenance', loc: 'Substation Alpha', time: '10:00 - 12:00' }
            ].map((p, i) => (
              <li key={i} className="bg-[#2d2d4a] p-4 rounded-lg flex justify-between items-center border-l-4 border-l-green-500">
                <div>
                  <div className="text-sm font-medium text-[#e0e0e0]">{p.task}</div>
                  <div className="text-xs text-[#b0b0c0] mt-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {p.loc} • {p.time}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-500 block">#{p.id}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded mt-1 inline-block">Active</span>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="link" className="text-[#FFC107] w-full mt-2 text-xs">View All Permits</Button>
        </div>

        {/* Crew Status Card */}
        <div className="petrolord-card p-6">
          <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-[#FFC107]" />
            Crew Status Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#252541] p-4 rounded-lg text-center border border-[#3a3a5a]">
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Checked In</div>
            </div>
            <div className="bg-[#252541] p-4 rounded-lg text-center border border-[#3a3a5a]">
              <div className="text-3xl font-bold text-orange-400">1</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Absent</div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-400 mb-3">Safety Compliance Checks</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm p-2 bg-[#2d2d4a]/50 rounded">
              <span className="text-[#e0e0e0]">Morning Toolbox Talk</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-[#2d2d4a]/50 rounded">
              <span className="text-[#e0e0e0]">PPE Inspection</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-[#2d2d4a]/50 rounded">
              <span className="text-[#e0e0e0]">Equipment Pre-check</span>
              <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="petrolord-card p-6 bg-gradient-to-r from-red-900/20 to-[#252541] border-red-500/20">
         <div className="flex items-start gap-4">
           <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
           <div>
             <h3 className="text-lg font-bold text-white">Safety Alert: Heavy Rain Expected</h3>
             <p className="text-sm text-gray-300 mt-1">
               Weather forecast indicates heavy rainfall starting at 14:00. Ensure all electrical equipment is covered and excavation works are secured.
             </p>
             <Button size="sm" variant="destructive" className="mt-3">Acknowledge</Button>
           </div>
         </div>
      </div>
    </DashboardLayout>
  );
}

export default SupervisorDashboard;