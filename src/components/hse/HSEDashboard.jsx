import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Activity, Shield, Droplet, FileText, Brain, ArrowRight, AlertTriangle, Users, ClipboardCheck, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Gamification Components
import SafetyScore from '@/components/gamification/SafetyScore';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';
import TeamLeaderboard from '@/components/gamification/TeamLeaderboard';

// AI Components
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';

// Organization Setup Components
import { OrganizationSetupAdvisory } from './OrganizationSetupAdvisory';
import { OrganizationSetup } from './OrganizationSetup';

// New World Heatmap
import WorldHeatmap from '@/components/petrolord/WorldHeatmap';

// Services — each tile is backed by a real aggregation (no mock fallbacks)
import { getHealthScore } from '../../services/healthService';
import { securityService } from '../../services/securityService';
import { fetchEnvironmentData } from '../../services/environmentService';
import { permitsService } from '../../services/permitsService';
import { riskService } from '../../services/riskService';
import { contractorService } from '../../services/contractorService';
import { auditService } from '../../services/auditService';
import { trainingService } from '../../services/trainingService';

export default function HSEDashboard() {
  const { setActiveModule, currentOrganization, role } = useHSE();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  
  // KPI metrics — one honest value per pillar (null = no data yet → '--')
  const [metrics, setMetrics] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Check if user is an admin to show setup advisory
  const isOrgAdmin = role === 'org_admin' || role === 'super_admin' || role === 'owner';
  const shouldShowAdvisory = isOrgAdmin && currentOrganization && !currentOrganization.setup_completed;

  useEffect(() => {
    if (currentOrganization?.id) {
      loadAllData();
    }
  }, [currentOrganization?.id]);

  const loadAllData = async () => {
    const orgId = currentOrganization.id;
    try {
      setDataLoading(true);
      const [health, security, environment, permits, risk, contractor, audit, training] = await Promise.all([
        getHealthScore(orgId).catch(() => null),
        securityService.getIncidentCount(orgId).catch(() => null),
        fetchEnvironmentData(orgId).catch(() => null),
        permitsService.getStats(orgId).catch(() => null),
        riskService.getDashboardStats(orgId).catch(() => null),
        contractorService.getDashboardMetrics(orgId).catch(() => null),
        auditService.getDashboardStats(orgId).catch(() => null),
        trainingService.getDashboardStats(orgId).catch(() => null),
      ]);

      setMetrics({
        healthScore: health,
        securityCount: security,
        envScore: environment?.environmental_score ?? null,
        permitsActive: permits?.active ?? null,
        criticalRisks: risk?.critical ?? null,
        activeContractors: contractor?.activeContractors ?? null,
        openFindings: audit?.openFindings ?? null,
        trainingRecords: training?.trainingRecords ?? null,
      });
    } catch (error) {
      console.error('❌ [HSE DASHBOARD] Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleGoToAI = () => {
    setActiveModule({ id: 'ai-analytics', label: 'AI Analytics', icon: Brain });
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-[var(--bg-app)] p-6 pb-24">
      {/* PETROLORD ORG SETUP BANNER v2 (2026-05-09): navigates to hub */}
      {shouldShowAdvisory && (
        <OrganizationSetupAdvisory 
          onSetupClick={() => setActiveModule({ id: 'admin-setup-hub', label: 'Setup Hub' })}
          onDismiss={() => {}}
        />
      )}

      {/* Organization Setup Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <OrganizationSetup 
             onComplete={() => setShowSetupWizard(false)}
             onCancel={() => setShowSetupWizard(false)}
           />
        </div>
      )}

      {/* AI Safety Predictor — now wired to real forecasts (forecast-safety edge fn →
          OpenAI → predictions table). The AI Forecast tab is the default view. */}
      {currentOrganization && (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="h-6 w-6 text-[#8b5cf6]" />
                AI Safety Predictor
              </h2>
              <Button 
                onClick={handleGoToAI}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center gap-2"
              >
                Full AI Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full bg-[#131320] border-2 border-[#8b5cf6] rounded-xl p-1 min-h-[400px]">
              <PredictiveInsightsDashboard isEmbedded={true} />
            </div>
          </div>

          <div className="my-8 h-px bg-[#3a3a5a]" />
        </>
      )}

      {/* Gamification Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-3">
          <SafetyScore />
        </div>
        <div className="md:col-span-5">
          <BadgesDisplay />
        </div>
        <div className="md:col-span-4 md:row-span-2">
          <TeamLeaderboard organizationId={currentOrganization?.id} />
        </div>
        
        {/* KPI Cards — every pillar, each backed by a real aggregation */}
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
           <KpiCard title="Health Score"       value={fmtPct(metrics?.healthScore)}      color="text-green-500"  icon={Activity}       loading={dataLoading} />
           <KpiCard title="Security Incidents"  value={fmtNum(metrics?.securityCount)}    color="text-red-500"    icon={Shield}         loading={dataLoading} />
           <KpiCard title="Env Score"           value={fmtPct(metrics?.envScore)}         color="text-blue-500"   icon={Droplet}        loading={dataLoading} />
           <KpiCard title="Permits Active"      value={fmtNum(metrics?.permitsActive)}    color="text-orange-500" icon={FileText}       loading={dataLoading} />
           <KpiCard title="Critical Risks"      value={fmtNum(metrics?.criticalRisks)}    color="text-yellow-500" icon={AlertTriangle}  loading={dataLoading} />
           <KpiCard title="Active Contractors"  value={fmtNum(metrics?.activeContractors)} color="text-cyan-500"  icon={Users}          loading={dataLoading} />
           <KpiCard title="Open Findings"       value={fmtNum(metrics?.openFindings)}     color="text-purple-500" icon={ClipboardCheck} loading={dataLoading} />
           <KpiCard title="Training Records"    value={fmtNum(metrics?.trainingRecords)}  color="text-pink-500"   icon={GraduationCap}  loading={dataLoading} />
        </div>
      </div>

      {/* REMOVED HSE OPERATIONAL MODULES SECTION COMPLETELY */}

      {/* World Heatmap (Global Operations Risk Map) — hidden until real site/risk data is wired.
          Currently uses static visualization with mock continent colors. To re-enable: change `false` to `true`. */}
      {false && (
        <div className="mb-8">
          <WorldHeatmap />
        </div>
      )}

    </div>
  );
}

// Honest formatters: null/undefined → '--' (no data), never a faked number.
const fmtNum = (v) => (v == null ? '--' : v);
const fmtPct = (v) => (v == null ? '--' : `${v}%`);

function KpiCard({ title, value, color, icon: Icon, loading }) {
  return (
    <div className="bg-[#252541] border-[#3a3a5a] p-4 rounded-xl flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[#7a7a9a] text-xs font-bold uppercase">{title}</p>
        <p className={`text-2xl font-bold text-white mt-1 ${loading ? 'opacity-50' : ''}`}>
          {loading ? '...' : value}
        </p>
      </div>
      <div className={`p-3 rounded-full bg-[#1a1a2e] ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}