import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, FileText, LayoutDashboard, GraduationCap, Building2, QrCode, Mic, Brain } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { cn } from '@/lib/utils';
import { accountCallout, accountRow } from '@/components/account/accountChrome';

// Design family (batch 2C): theme roles only. Icons sit in neutral tiles
// (colour is kept for status); the admin callout is the info callout from the
// shared account chrome.
const iconTile = 'h-10 w-10 bg-pl-sunken text-pl-primary-text rounded-lg flex items-center justify-center mb-4';
const linkButton = 'text-pl-primary-text text-sm hover:underline flex items-center';

export default function GettingStarted() {
  const { setActiveModule, role } = useHSE();
  const isOrgAdmin = role === 'org_admin' || role === 'super_admin' || role === 'owner';

  const goTo = (id, label) => setActiveModule({ id, label });

  return (
    <div className="space-y-10">
      {/* Intro Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-4">Welcome to Petrolord HSE</h2>
          <p className="text-pl-muted leading-relaxed mb-6">
            Petrolord HSE is your platform for managing health, safety, and environmental compliance.
            Designed for the modern energy enterprise, it unifies risk management, incident reporting, and analytics into a single, intuitive interface.
          </p>
        </div>
        <div className="bg-pl-surface rounded-xl border border-pl-border shadow-pl-sm p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-pl-muted mb-4">What you can do here</h4>
          <ul className="space-y-3 text-sm text-pl-text">
            <li className="flex items-center gap-3"><Mic className="h-4 w-4 text-pl-primary-text flex-shrink-0" aria-hidden="true" /> Report hazards by voice, photo, or text in under a minute</li>
            <li className="flex items-center gap-3"><QrCode className="h-4 w-4 text-pl-primary-text flex-shrink-0" aria-hidden="true" /> Let anyone on site report by scanning a QR poster, with no login</li>
            <li className="flex items-center gap-3"><Brain className="h-4 w-4 text-pl-primary-text flex-shrink-0" aria-hidden="true" /> Get AI forecasts of what is most likely to happen next, from your own data</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-pl-primary-text flex-shrink-0" aria-hidden="true" /> Track permits, audits, training, risk, and environment in one place</li>
          </ul>
        </div>
      </div>

      {/* Admin setup callout */}
      {isOrgAdmin && (
        <div className={cn(accountCallout('info'), 'rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4')}>
          <Building2 className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h4 className="font-bold text-pl-text">Setting up a new organization?</h4>
            <p className="text-sm text-pl-text mt-1">
              Add your sites and departments, invite your team, and print site QR posters from the Organization Setup hub. The dashboard checklist tracks your progress.
            </p>
          </div>
          <Button
            onClick={() => goTo('admin-setup-hub', 'Setup Hub')}
            className="font-semibold gap-1 flex-shrink-0"
          >
            Open Setup Hub <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Quick Start Steps */}
      <div>
        <h3 className="text-2xl font-semibold text-pl-text mb-6">First Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className={iconTile}>
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle>1. Submit your first report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pl-muted text-sm mb-4">
                Quick Report is the heart of the platform. Describe what you observed by voice, photo, or text and submit it in under a minute.
              </p>
              <button onClick={() => goTo('my-reports', 'My Reports')} className={linkButton}>
                Go to My Reports <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className={iconTile}>
                <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle>2. Explore your dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pl-muted text-sm mb-4">
                See your organization's live safety picture: KPI tiles for every pillar, your safety score, and the AI safety forecast.
              </p>
              <button onClick={() => goTo('dashboard', 'Dashboard')} className={linkButton}>
                Open Dashboard <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className={iconTile}>
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle>3. Check your training</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pl-muted text-sm mb-4">
                Review the training programs and competency assessments assigned to you, and see what is coming up on the schedule.
              </p>
              <button onClick={() => goTo('training', 'Training')} className={linkButton}>
                View Training <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-4 sm:p-8">
        <h3 className="text-xl font-semibold text-pl-text mb-6">Understanding Your Role</h3>
        <div className="space-y-4">
          {[
            { role: 'Member', desc: 'Submits quick reports, completes training, sees the dashboard, leaderboard, and their own reports.' },
            { role: 'Supervisor', desc: 'Everything a member does, plus the Supervisor View: triage incoming reports, assign owners, run 5-Whys investigations, and resolve.' },
            { role: 'Manager', desc: 'Module oversight: analytics, contractors, audits, work permits, and team management for their areas.' },
            { role: 'Admin', desc: 'Full access, including Organization Setup (sites, departments, QR posters), member management, and settings. The person who created the organization is an admin.' }
          ].map((item, idx) => (
            <div key={idx} className={cn(accountRow, 'flex-col items-start sm:flex-row sm:items-start justify-start gap-3 sm:gap-4 p-4 rounded-lg')}>
              <div className="bg-pl-surface border border-pl-border text-pl-text px-3 py-1 rounded text-xs font-bold uppercase tracking-wide min-w-[90px] text-center">
                {item.role}
              </div>
              <p className="text-pl-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
