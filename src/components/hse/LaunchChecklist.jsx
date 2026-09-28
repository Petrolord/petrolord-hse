// src/components/hse/LaunchChecklist.jsx
// First-login setup checklist for org admins (launch runway Phase 3).
//
// Replaces the old OrganizationSetupAdvisory banner, which nagged forever
// because nothing ever persisted setup_completed. Shows live progress for the
// four getting-started steps; once the three structural steps are done it
// persists completion via orgAdminService.completeOrgSetup and disappears.
// Also routes a brand-new org admin (no sites, no departments) into the
// Setup Hub once per session.

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Rocket, QrCode, ChevronRight } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { useToast } from '@/components/ui/use-toast';
import { orgAdminService } from '@/services/orgAdminService';

const Step = ({ done, title, description, actionLabel, onAction }) => (
  <div className="flex items-start gap-3 py-3">
    {done ? (
      <CheckCircle2 className="w-5 h-5 text-pl-success-text flex-shrink-0 mt-0.5" aria-label="Done" />
    ) : (
      <Circle className="w-5 h-5 text-pl-border-strong flex-shrink-0 mt-0.5" aria-label="To do" />
    )}
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-medium ${done ? 'text-pl-muted line-through' : 'text-pl-text'}`}>{title}</div>
      {!done && <div className="text-xs text-pl-muted mt-0.5">{description}</div>}
    </div>
    {!done && (
      <button
        onClick={onAction}
        className="flex items-center gap-1 rounded-sm text-xs font-semibold text-pl-primary-text hover:text-pl-primary-text-hover flex-shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus"
      >
        {actionLabel} <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

export default function LaunchChecklist() {
  const { currentOrganization, role, setActiveModule, refreshContext } = useHSE();
  const { toast } = useToast();
  const [status, setStatus] = useState(null);
  const completingRef = useRef(false);

  const isOrgAdmin = role === 'org_admin' || role === 'super_admin' || role === 'owner';
  const orgId = currentOrganization?.id;
  const show = isOrgAdmin && currentOrganization && !currentOrganization.setup_completed;

  useEffect(() => {
    if (!show || !orgId) return;
    orgAdminService.getSetupStatus(orgId).then(({ data }) => {
      if (!data) return;
      setStatus(data);

      // Brand-new org: steer the admin into the Setup Hub, once per session.
      const guardKey = `hse-setup-routed-${orgId}`;
      if (data.siteCount === 0 && data.departmentCount === 0 && !sessionStorage.getItem(guardKey)) {
        sessionStorage.setItem(guardKey, '1');
        setActiveModule({ id: 'admin-setup-hub', label: 'Setup Hub' });
      }
    });
  }, [show, orgId]);

  // Persist completion once the structural steps are done.
  useEffect(() => {
    const structuralDone = status && status.siteCount > 0 && status.departmentCount > 0
      && (status.memberCount > 1 || status.pendingInviteCount > 0);
    if (!structuralDone || !show || completingRef.current) return;
    completingRef.current = true;
    orgAdminService.completeOrgSetup(orgId).then(({ error }) => {
      if (!error) {
        toast({ title: 'Setup complete', description: 'Your organization is ready. You can manage sites, departments, and members anytime from Organization Setup.' });
        refreshContext();
      } else {
        completingRef.current = false;
      }
    });
  }, [status, show, orgId]);

  if (!show || !status) return null;

  const goTo = (id, label) => setActiveModule({ id, label });

  return (
    <div className="rounded-xl border border-pl-border bg-pl-surface p-5 mb-6 shadow-pl-sm">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="w-5 h-5 text-pl-primary-text" aria-hidden="true" />
        <h3 className="font-semibold text-pl-text">Get your organization up and running</h3>
      </div>
      <p className="text-xs text-pl-muted mb-2">
        Complete these steps so reports are organized from day one.
      </p>

      <div className="divide-y divide-pl-border">
        <Step
          done={status.siteCount > 0}
          title="Add your first site"
          description="The physical locations where work happens. Each site gets its own QR code for instant observations."
          actionLabel="Add site"
          onAction={() => goTo('admin-sites', 'Sites')}
        />
        <Step
          done={status.departmentCount > 0}
          title="Create your departments"
          description="Reports and actions are grouped by department, for example Operations, Maintenance, HSE."
          actionLabel="Add departments"
          onAction={() => goTo('admin-departments', 'Departments')}
        />
        <Step
          done={status.memberCount > 1 || status.pendingInviteCount > 0}
          title="Invite your team"
          description="Invite employees and supervisors. If email is unavailable you get a link to share directly."
          actionLabel="Invite"
          onAction={() => goTo('team', 'Team Management')}
        />
        <Step
          done={status.reportCount > 0}
          title="Submit your first observation"
          description="Try the Quick Report flow so you see exactly what your team will use."
          actionLabel="My Reports"
          onAction={() => goTo('my-reports', 'My Reports')}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-pl-border flex items-center gap-2 text-xs text-pl-muted">
        <QrCode className="w-4 h-4 text-pl-accent-text flex-shrink-0" aria-hidden="true" />
        <span>
          Tip: open a site in{' '}
          <button onClick={() => goTo('admin-sites', 'Sites')} className="rounded-sm text-pl-primary-text hover:text-pl-primary-text-hover font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus">
            Sites
          </button>{' '}
          and print its QR poster so anyone on location can report without logging in.
        </span>
      </div>
    </div>
  );
}
