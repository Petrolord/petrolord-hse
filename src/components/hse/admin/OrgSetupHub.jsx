// src/components/hse/admin/OrgSetupHub.jsx
// PETROLORD ORG SETUP HUB v1 (2026-05-09)
//
// Landing page for /dashboard/admin/setup. Shows setup completion status
// with three cards (Sites, Departments, Members) that navigate to their
// respective admin modules.
//
// Reads from orgAdminService.getSetupStatus for live counts.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, MapPin, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { orgAdminService } from '@/services/orgAdminService';

const SetupCard = ({ icon: Icon, title, description, count, label, complete, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start gap-3 rounded-lg border border-pl-border bg-pl-surface p-5 text-left shadow-pl-sm transition-colors hover:border-pl-primary/50 hover:bg-pl-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus"
  >
    <div className="flex items-center justify-between w-full">
      <div className="p-2 rounded-lg bg-pl-primary/10 text-pl-primary-text">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      {complete ? (
        <span className="flex items-center gap-1 text-xs font-medium text-pl-success-text">
          <CheckCircle className="w-5 h-5" aria-hidden="true" /> Done
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-medium text-pl-muted">
          <Circle className="w-5 h-5 text-pl-border-strong" aria-hidden="true" /> To do
        </span>
      )}
    </div>
    <div>
      <h3 className="font-semibold text-pl-text">{title}</h3>
      <p className="text-xs text-pl-muted mt-1">{description}</p>
    </div>
    <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-pl-border">
      <div className="text-sm">
        <span className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text">{count}</span>
        <span className="text-pl-muted ml-1">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-pl-muted group-hover:text-pl-text group-hover:translate-x-1 transition-all" aria-hidden="true" />
    </div>
  </button>
);

export default function OrgSetupHub() {
  const { currentOrganization, setActiveModule, refreshContext } = useHSE();
  const [status, setStatus] = useState({
    siteCount: 0,
    departmentCount: 0,
    memberCount: 0,
    pendingInviteCount: 0,
    setupComplete: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    orgAdminService.getSetupStatus(currentOrganization.id).then(({ data }) => {
      if (data) setStatus(data);
      setLoading(false);
    });
  }, [currentOrganization?.id]);

  // Persist completion on the organization the first time the structural
  // steps are all done (see also LaunchChecklist, which does the same from
  // the dashboard side).
  useEffect(() => {
    const structuralDone = status.siteCount > 0 && status.departmentCount > 0
      && (status.memberCount > 1 || status.pendingInviteCount > 0);
    if (!structuralDone || !currentOrganization || currentOrganization.setup_completed) return;
    orgAdminService.completeOrgSetup(currentOrganization.id).then(({ error }) => {
      if (!error) refreshContext();
    });
  }, [status, currentOrganization?.id]);

  const goTo = (moduleId, label) => {
    setActiveModule({ id: moduleId, label });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text">Organization Setup</h1>
        <p className="text-pl-muted mt-1 text-sm">
          Configure your organization's structure to enable better safety reporting and team coordination.
        </p>
      </div>

      {!loading && status.setupComplete && (
        <div className="rounded-lg border border-pl-success/40 bg-pl-success-bg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-pl-success-text flex-shrink-0" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-pl-success-text">Setup is complete</div>
            <div className="text-xs text-pl-text mt-0.5">
              You can revisit this page anytime to manage sites, departments, and members.
            </div>
          </div>
        </div>
      )}

      {!loading && !status.setupComplete && (
        <div className="rounded-lg border border-pl-info/40 bg-pl-info-bg p-4 mb-6">
          <div className="text-sm font-medium text-pl-info-text">Get started in 3 quick steps</div>
          <div className="text-xs text-pl-text mt-1">
            Add at least one site and one department, then invite your team. Quick Reports will use this structure to organize incident data.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SetupCard
          icon={MapPin}
          title="Sites"
          description="Physical locations where work happens: rigs, plants, offices, depots."
          count={loading ? '...' : status.siteCount}
          label={status.siteCount === 1 ? 'site' : 'sites'}
          complete={status.siteCount > 0}
          onClick={() => goTo('admin-sites', 'Sites')}
        />
        <SetupCard
          icon={Building2}
          title="Departments"
          description="Functional units within your organization: HSE, Operations, Maintenance."
          count={loading ? '...' : status.departmentCount}
          label={status.departmentCount === 1 ? 'department' : 'departments'}
          complete={status.departmentCount > 0}
          onClick={() => goTo('admin-departments', 'Departments')}
        />
        <SetupCard
          icon={Users}
          title="Members"
          description="Invite team members and assign roles to control access."
          count={loading ? '...' : status.memberCount}
          label={status.memberCount === 1 ? 'member' : 'members'}
          complete={status.memberCount > 1}
          onClick={() => goTo('team', 'Team Management')}
        />
      </div>

      <div className="mt-10 text-xs text-pl-muted">
        Need help? Reach out to support@petrolord.com or visit the Help Center.
      </div>
    </motion.div>
  );
}
