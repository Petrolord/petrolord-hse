import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export default function GettingStarted() {
  return (
    <div className="space-y-10">
      {/* Intro Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Welcome to Petrolord HSE</h2>
          <p className="text-[#b0b0c0] leading-relaxed mb-6">
            Petrolord HSE is your comprehensive platform for managing health, safety, and environmental compliance. 
            Designed for the modern energy enterprise, it unifies risk management, incident reporting, and analytics into a single, intuitive interface.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#FFC107] text-black hover:bg-[#e0a800]">
              <PlayCircle className="mr-2 h-4 w-4" /> Watch Tour
            </Button>
            <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]">
              Download User Manual
            </Button>
          </div>
        </div>
        <div className="bg-[#252541] rounded-xl border border-[#3a3a5a] p-2">
          {/* Placeholder for Video/Image */}
          <div className="aspect-video bg-[#1a1a2e] rounded-lg flex items-center justify-center relative group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFC107]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Dashboard Preview" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <PlayCircle className="h-8 w-8 text-black fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Steps */}
      <div>
        <h3 className="text-2xl font-bold mb-6">First Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">1. Complete Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Update your contact details, emergency contacts, and notification preferences to ensure you stay connected.
              </p>
              <a href="#" className="text-blue-400 text-sm hover:underline flex items-center">
                Go to Profile <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">2. Security Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Enable Two-Factor Authentication (2FA) and review your recent login activity to secure your account.
              </p>
              <a href="#" className="text-green-400 text-sm hover:underline flex items-center">
                Security Settings <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">3. Review Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Check your Action Tracker for any assigned tasks, pending approvals, or training requirements due.
              </p>
              <a href="#" className="text-purple-400 text-sm hover:underline flex items-center">
                View My Tasks <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-8">
        <h3 className="text-xl font-bold mb-6">Understanding Your Role</h3>
        <div className="space-y-4">
          {[
            { role: 'Staff', desc: 'Can report incidents, view assigned tasks, and complete training.' },
            { role: 'Officer', desc: 'Can investigate incidents, conduct inspections, and manage module-specific data.' },
            { role: 'Manager', desc: 'Can approve actions, view department analytics, and manage team performance.' },
            { role: 'Admin', desc: 'Full system access, user management, and configuration control.' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a2e]/50 border border-[#3a3a5a]/50">
              <div className="bg-[#3a3a5a] px-3 py-1 rounded text-xs font-bold uppercase tracking-wide min-w-[80px] text-center">
                {item.role}
              </div>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}