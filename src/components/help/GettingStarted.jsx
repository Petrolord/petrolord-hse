import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, FileText, LayoutDashboard, GraduationCap, Building2, QrCode, Mic, Camera, Brain } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';

export default function GettingStarted() {
  const { setActiveModule, role } = useHSE();
  const isOrgAdmin = role === 'org_admin' || role === 'super_admin' || role === 'owner';

  const goTo = (id, label) => setActiveModule({ id, label });

  return (
    <div className="space-y-10">
      {/* Intro Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Welcome to Petrolord HSE</h2>
          <p className="text-[#b0b0c0] leading-relaxed mb-6">
            Petrolord HSE is your platform for managing health, safety, and environmental compliance.
            Designed for the modern energy enterprise, it unifies risk management, incident reporting, and analytics into a single, intuitive interface.
          </p>
        </div>
        <div className="bg-[#252541] rounded-xl border border-[#3a3a5a] p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#7a7a9a] mb-4">What you can do here</h4>
          <ul className="space-y-3 text-sm text-[#b0b0c0]">
            <li className="flex items-center gap-3"><Mic className="h-4 w-4 text-[#FFC107] flex-shrink-0" /> Report hazards by voice, photo, or text in under a minute</li>
            <li className="flex items-center gap-3"><QrCode className="h-4 w-4 text-[#FFC107] flex-shrink-0" /> Let anyone on site report by scanning a QR poster, with no login</li>
            <li className="flex items-center gap-3"><Brain className="h-4 w-4 text-[#FFC107] flex-shrink-0" /> Get AI forecasts of what is most likely to happen next, from your own data</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#FFC107] flex-shrink-0" /> Track permits, audits, training, risk, and environment in one place</li>
          </ul>
        </div>
      </div>

      {/* Admin setup callout */}
      {isOrgAdmin && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4">
          <Building2 className="h-8 w-8 text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-white">Setting up a new organization?</h4>
            <p className="text-sm text-[#b0b0c0] mt-1">
              Add your sites and departments, invite your team, and print site QR posters from the Organization Setup hub. The dashboard checklist tracks your progress.
            </p>
          </div>
          <button
            onClick={() => goTo('admin-setup-hub', 'Setup Hub')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 flex-shrink-0"
          >
            Open Setup Hub <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Quick Start Steps */}
      <div>
        <h3 className="text-2xl font-bold mb-6">First Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">1. Submit your first report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Quick Report is the heart of the platform. Describe what you observed by voice, photo, or text and submit it in under a minute.
              </p>
              <button onClick={() => goTo('my-reports', 'My Reports')} className="text-blue-400 text-sm hover:underline flex items-center">
                Go to My Reports <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">2. Explore your dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                See your organization's live safety picture: KPI tiles for every pillar, your safety score, and the AI safety forecast.
              </p>
              <button onClick={() => goTo('dashboard', 'Dashboard')} className="text-green-400 text-sm hover:underline flex items-center">
                Open Dashboard <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <div className="h-10 w-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle className="text-white">3. Check your training</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Review the training programs and competency assessments assigned to you, and see what is coming up on the schedule.
              </p>
              <button onClick={() => goTo('training', 'Training')} className="text-purple-400 text-sm hover:underline flex items-center">
                View Training <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-[#252541] border border-[#3a3a5a] rounded-xl p-8">
        <h3 className="text-xl font-bold mb-6">Understanding Your Role</h3>
        <div className="space-y-4">
          {[
            { role: 'Member', desc: 'Submits quick reports, completes training, sees the dashboard, leaderboard, and their own reports.' },
            { role: 'Supervisor', desc: 'Everything a member does, plus the Supervisor View: triage incoming reports, assign owners, run 5-Whys investigations, and resolve.' },
            { role: 'Manager', desc: 'Module oversight: analytics, contractors, audits, work permits, and team management for their areas.' },
            { role: 'Admin', desc: 'Full access, including Organization Setup (sites, departments, QR posters), member management, and settings. The person who created the organization is an admin.' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a2e]/50 border border-[#3a3a5a]/50">
              <div className="bg-[#3a3a5a] px-3 py-1 rounded text-xs font-bold uppercase tracking-wide min-w-[90px] text-center">
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
