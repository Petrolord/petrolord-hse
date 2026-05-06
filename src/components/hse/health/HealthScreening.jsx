import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function HealthScreening() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Health Screenings</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Schedule Screening</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white text-base">Next Due</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Annual Physical</h3>
            <p className="text-[#8f8fdb] mt-1">Due: Oct 15, 2025</p>
            <Button size="sm" variant="outline" className="mt-4 border-[#3a3a5a] text-blue-400">Book Now</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white text-base">Last Completed</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Audiometry</h3>
            <p className="text-[#8f8fdb] mt-1">Completed: Aug 10, 2024</p>
            <p className="text-green-400 text-sm mt-2">Result: Normal</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Screening History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left">
            <thead className="text-[#7a7a9a] uppercase text-xs border-b border-[#3a3a5a]">
              <tr>
                <th className="py-3">Type</th>
                <th className="py-3">Date</th>
                <th className="py-3">Provider</th>
                <th className="py-3">Result</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[#e0e0e0] divide-y divide-[#3a3a5a]">
              <tr>
                <td className="py-3 font-medium">Audiometry</td>
                <td className="py-3">Aug 10, 2024</td>
                <td className="py-3">Dr. Smith (City Clinic)</td>
                <td className="py-3"><span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">Normal</span></td>
                <td className="py-3"><Button variant="ghost" size="sm" className="text-blue-400 h-8">View Report</Button></td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Pre-employment Check</td>
                <td className="py-3">Jan 15, 2023</td>
                <td className="py-3">MediCorp</td>
                <td className="py-3"><span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">Fit</span></td>
                <td className="py-3"><Button variant="ghost" size="sm" className="text-blue-400 h-8">View Report</Button></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}