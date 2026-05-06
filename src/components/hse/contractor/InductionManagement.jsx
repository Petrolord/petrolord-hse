import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileCheck, Users } from 'lucide-react';

export default function InductionManagement() {
  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Induction Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">New Induction Session</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-blue-500/10 mb-4"><PlayCircle className="h-8 w-8 text-blue-400" /></div>
            <h3 className="text-lg font-bold text-white">Online Modules</h3>
            <p className="text-sm text-[#7a7a9a] mt-2 mb-4">Manage digital induction videos and quizzes.</p>
            <Button variant="outline" className="w-full border-[#3a3a5a] text-white">Manage Modules</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-green-500/10 mb-4"><Users className="h-8 w-8 text-green-400" /></div>
            <h3 className="text-lg font-bold text-white">Pending Inductions</h3>
            <p className="text-sm text-[#7a7a9a] mt-2 mb-4">12 Contractors waiting for verification.</p>
            <Button variant="outline" className="w-full border-[#3a3a5a] text-white">Verify Records</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-purple-500/10 mb-4"><FileCheck className="h-8 w-8 text-purple-400" /></div>
            <h3 className="text-lg font-bold text-white">Certificates</h3>
            <p className="text-sm text-[#7a7a9a] mt-2 mb-4">Generate and print induction cards.</p>
            <Button variant="outline" className="w-full border-[#3a3a5a] text-white">View Certificates</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 bg-[#252541] border border-[#3a3a5a] rounded-lg p-8 flex items-center justify-center text-[#7a7a9a]">
        Induction records table placeholder
      </div>
    </div>
  );
}