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

// Organization Setup
import LaunchChecklist from './LaunchChecklist';

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

// Design system (wave 0 pilot): the HSE dashboard renders inside the
// signed-in scope (src/design/SignedInScope.jsx), so it uses the theme roles
// directly. KPI icons are neutral; colour is kept for status.
export default function HSEDashboard() {
  const { setActiveModule, currentOrganization } = useHSE();

  // KPI metrics — one honest value per pillar (null = no data yet → '--')
  const [metrics, setMetrics] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

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
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-pl-bg text-pl-text p-4 sm:p-6 pb-24">
      {/* Setup checklist for org admins until setup_completed is persisted */}
      <LaunchChecklist />

      {/* AI Safety Predictor — now wired to real forecasts (forecast-safety edge fn →
          OpenAI → predictions table). The AI Forecast tab is the default view. */}
      {currentOrganization && (
        <>
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text flex items-center gap-2">
                <Brain className="h-6 w-6 text-pl-primary-text" aria-hidden="true" />
                AI Safety Predictor
              </h2>
              <Button 
                onClick={handleGoToAI}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                Full AI Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            
            <div className="w-full rounded-xl border border-pl-border bg-pl-sunken/40 p-3 sm:p-4 min-h-[400px]">
              <PredictiveInsightsDashboard isEmbedded={true} />
            </div>
          </div>

          <div className="my-8 h-px bg-pl-border" />
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
           <KpiCard title="Health Score"       value={fmtPct(metrics?.healthScore)}       icon={Activity}       loading={dataLoading} />
           <KpiCard title="Security Incidents"  value={fmtNum(metrics?.securityCount)}     icon={Shield}         loading={dataLoading} />
           <KpiCard title="Env Score"           value={fmtPct(metrics?.envScore)}          icon={Droplet}        loading={dataLoading} />
           <KpiCard title="Permits Active"      value={fmtNum(metrics?.permitsActive)}     icon={FileText}       loading={dataLoading} />
           <KpiCard title="Critical Risks"      value={fmtNum(metrics?.criticalRisks)}     icon={AlertTriangle}  loading={dataLoading} />
           <KpiCard title="Active Contractors"  value={fmtNum(metrics?.activeContractors)} icon={Users}          loading={dataLoading} />
           <KpiCard title="Open Findings"       value={fmtNum(metrics?.openFindings)}      icon={ClipboardCheck} loading={dataLoading} />
           <KpiCard title="Training Records"    value={fmtNum(metrics?.trainingRecords)}   icon={GraduationCap}  loading={dataLoading} />
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

// A KPI tile on the roles: label, mono value and a neutral icon.
function KpiCard({ title, value, icon: Icon, loading }) {
  return (
    <div className="rounded-xl border border-pl-border bg-pl-surface p-4 flex items-center justify-between gap-2 shadow-pl-sm" aria-busy={loading || undefined}>
      <div className="min-w-0">
        <p className="text-pl-muted text-xs font-semibold uppercase leading-snug">{title}</p>
        <p className={`font-pl-mono tabular-nums text-2xl font-semibold text-pl-text mt-1 ${loading ? 'opacity-50' : ''}`}>
          {loading ? '...' : value}
        </p>
      </div>
      <div className="hidden sm:block shrink-0 p-2 rounded-full bg-pl-sunken text-pl-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
  );
}