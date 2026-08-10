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

const SetupCard = ({ icon: Icon, title, description, count, label, complete, onClick, color }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start gap-3 bg-[#1f1f35] border border-[#2d2d4a] rounded-lg p-5 text-left hover:border-blue-500/40 hover:bg-[#252541] transition-all"
  >
    <div className="flex items-center justify-between w-full">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {complete ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <Circle className="w-5 h-5 text-slate-600" />
      )}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
    <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-[#2d2d4a]">
      <div className="text-sm">
        <span className="text-2xl font-bold text-white">{count}</span>
        <span className="text-slate-400 ml-1">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </div>
  </button>
);

export default function OrgSetupHub() {
  const { currentOrganization, setActiveModule } = useHSE();
  const [status, setStatus] = useState({
    siteCount: 0,
    departmentCount: 0,
    memberCount: 0,
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

  const goTo = (moduleId, label) => {
    setActiveModule({ id: moduleId, label });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Organization Setup</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Configure your organization's structure to enable better safety reporting and team coordination.
        </p>
      </div>

      {!loading && status.setupComplete && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-white">Setup is complete</div>
            <div className="text-xs text-slate-400 mt-0.5">
              You can revisit this page anytime to manage sites, departments, and members.
            </div>
          </div>
        </div>
      )}

      {!loading && !status.setupComplete && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-white">Get started in 3 quick steps</div>
          <div className="text-xs text-slate-400 mt-1">
            Add at least one site and one department, then invite your team. Quick Reports will use this structure to organize incident data.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SetupCard
          icon={MapPin}
          title="Sites"
          description="Physical locations where work happens — rigs, plants, offices, depots."
          count={loading ? '—' : status.siteCount}
          label={status.siteCount === 1 ? 'site' : 'sites'}
          complete={status.siteCount > 0}
          color="bg-blue-600"
          onClick={() => goTo('admin-sites', 'Sites')}
        />
        <SetupCard
          icon={Building2}
          title="Departments"
          description="Functional units within your organization — HSE, Operations, Maintenance."
          count={loading ? '—' : status.departmentCount}
          label={status.departmentCount === 1 ? 'department' : 'departments'}
          complete={status.departmentCount > 0}
          color="bg-purple-600"
          onClick={() => goTo('admin-departments', 'Departments')}
        />
        <SetupCard
          icon={Users}
          title="Members"
          description="Invite team members and assign roles to control access."
          count={loading ? '—' : status.memberCount}
          label={status.memberCount === 1 ? 'member' : 'members'}
          complete={status.memberCount > 1}
          color="bg-emerald-600"
          onClick={() => goTo('team', 'Team Management')}
        />
      </div>

      <div className="mt-10 text-xs text-slate-500">
        Need help? Reach out to support@petrolord.com or visit the Help Center.
      </div>
    </motion.div>
  );
}
