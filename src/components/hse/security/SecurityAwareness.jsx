import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, AlertTriangle, CheckCircle, Brain, Target } from 'lucide-react';

export default function SecurityAwareness() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 to-[#1e1e30] border border-purple-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 rounded-full">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Awareness Score: 85/100</h2>
            <p className="text-purple-200 text-sm">You are in the top 10% of employees!</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">View Certificates</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Take Assessment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mandatory Training */}
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Mandatory Training</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <TrainingItem 
              title="Phishing Awareness 2025" 
              due="Due: Jan 30, 2025" 
              progress={100} 
              status="Completed" 
            />
            <TrainingItem 
              title="Data Privacy & GDPR" 
              due="Due: Feb 15, 2025" 
              progress={60} 
              status="In Progress" 
            />
            <TrainingItem 
              title="Physical Security Basics" 
              due="Due: Mar 01, 2025" 
              progress={0} 
              status="Not Started" 
            />
            <Button className="w-full mt-4 bg-[#2a2a40] hover:bg-[#3a3a5a] text-white border border-[#3a3a5a]">
              View All Courses
            </Button>
          </CardContent>
        </Card>

        {/* Phishing Simulation */}
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Phishing Simulation Results</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#252541] rounded-lg text-center">
                <Target className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">2.5%</div>
                <div className="text-xs text-gray-400">Your Click Rate</div>
              </div>
              <div className="p-4 bg-[#252541] rounded-lg text-center">
                <ShieldCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-xs text-gray-400">Report Rate</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Simulation History</h4>
              <div className="flex justify-between items-center p-3 bg-[#2a2a40] rounded border border-green-500/20">
                <span className="text-white text-sm">Oct 2024 Campaign</span>
                <Badge className="bg-green-500/20 text-green-400 border-none hover:bg-green-500/20">Reported</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#2a2a40] rounded border border-green-500/20">
                <span className="text-white text-sm">Dec 2024 Campaign</span>
                <Badge className="bg-green-500/20 text-green-400 border-none hover:bg-green-500/20">Reported</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Incident Reporting Rate" value="High" desc="+15% vs Dept Avg" />
        <MetricCard label="Policy Compliance" value="98%" desc="Consistent adherence" />
        <MetricCard label="Training Completion" value="85%" desc="2 modules pending" />
      </div>
    </div>
  );
}

function TrainingItem({ title, due, progress, status }) {
  const statusColor = status === 'Completed' ? 'text-green-400' : status === 'In Progress' ? 'text-yellow-400' : 'text-gray-400';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-white font-medium text-sm">{title}</h4>
          <p className="text-xs text-gray-500">{due}</p>
        </div>
        <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

function MetricCard({ label, value, desc }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40]">
      <CardContent className="p-6">
        <p className="text-gray-400 text-xs uppercase font-bold">{label}</p>
        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        <p className="text-green-400 text-xs mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ShieldCheck({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}