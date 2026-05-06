import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Activity, Shield, Droplet, FileText, Brain, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Gamification Components
import SafetyScore from '@/components/gamification/SafetyScore';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';
import TeamLeaderboard from '@/components/gamification/TeamLeaderboard';

// AI Components
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';
import AITestPanel from '@/components/analytics/AITestPanel';

// Organization Setup Components
import { OrganizationSetupAdvisory } from './OrganizationSetupAdvisory';
import { OrganizationSetup } from './OrganizationSetup';

// New World Heatmap
import WorldHeatmap from '@/components/petrolord/WorldHeatmap';

// Services
import { fetchHealthData } from '../../services/healthService';
import { fetchSecurityData } from '../../services/securityService';
import { fetchEnvironmentData } from '../../services/environmentService';

export default function HSEDashboard() {
  const { setActiveModule, currentOrganization, role } = useHSE();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  
  // New Data States
  const [healthData, setHealthData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [environmentData, setEnvironmentData] = useState(null);
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
    try {
      setDataLoading(true);
      const [health, security, environment] = await Promise.all([
        fetchHealthData(currentOrganization.id).catch(() => null),
        fetchSecurityData(currentOrganization.id).catch(() => null),
        fetchEnvironmentData(currentOrganization.id).catch(() => null),
      ]);
      setHealthData(health);
      setSecurityData(security);
      setEnvironmentData(environment);
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
      
      {/* 1. DIAGNOSTIC PANEL - MUST BE VISIBLE IF RENDERING IS WORKING */}
      <AITestPanel />

      {/* Organization Setup Advisory Banner */}
      {shouldShowAdvisory && (
        <OrganizationSetupAdvisory 
          onSetupClick={() => setShowSetupWizard(true)}
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

      {/* 2. AI PREDICTION SECTION - DIRECT EMBED */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#8b5cf6]" />
            AI Safety Predictor (Integrated)
          </h2>
          <Button 
            onClick={handleGoToAI}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center gap-2"
          >
            Full AI Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* CONTAINER WITH CLEAR DIMENSIONS TO PREVENT COLLAPSE */}
        <div className="w-full bg-[#131320] border-2 border-[#8b5cf6] rounded-xl p-1 min-h-[400px]">
          <PredictiveInsightsDashboard isEmbedded={true} />
        </div>
      </div>

      <div className="my-8 h-px bg-[#3a3a5a]" />

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
        
        {/* KPI Cards */}
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
           <KpiCard 
             title="Health Score" 
             value={healthData ? `${healthData.health_score}%` : '--'} 
             color="text-green-500" 
             icon={Activity} 
             loading={dataLoading}
           />
           <KpiCard 
             title="Security Incidents" 
             value={securityData ? securityData.total_incidents : '--'} 
             color="text-red-500" 
             icon={Shield} 
             loading={dataLoading}
           />
           <KpiCard 
             title="Env Score" 
             value={environmentData ? `${environmentData.environmental_score}%` : '--'} 
             color="text-blue-500" 
             icon={Droplet} 
             loading={dataLoading}
           />
           <KpiCard 
             title="Permits Active" 
             value="8" 
             color="text-orange-500" 
             icon={FileText} 
             loading={dataLoading}
           />
        </div>
      </div>

      {/* REMOVED HSE OPERATIONAL MODULES SECTION COMPLETELY */}

      {/* NEW: World Heatmap Section */}
      <div className="mb-8">
        <WorldHeatmap />
      </div>

    </div>
  );
}

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