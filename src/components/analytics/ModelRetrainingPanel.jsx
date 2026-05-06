import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { modelService } from '@/services/modelService';
import { useHSE } from '@/context/HSEContext';
import { RefreshCw, CheckCircle, Clock, Database, Brain } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function ModelRetrainingPanel() {
  const { currentOrganization } = useHSE();
  const [versions, setVersions] = useState([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadData();
      subscribeToJobs();
    }
    return () => { supabase.removeAllChannels(); };
  }, [currentOrganization]);

  const loadData = async () => {
    const data = await modelService.getModelVersions(currentOrganization.id);
    setVersions(data);
    
    // Check if any job is running
    const jobs = await modelService.getRetrainingJobs(currentOrganization.id);
    if (jobs.length > 0 && jobs[0].status === 'running') {
      startProgressSimulation();
    }
  };

  const subscribeToJobs = () => {
    supabase.channel('public:retraining_jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retraining_jobs', filter: `organization_id=eq.${currentOrganization.id}` }, 
        () => loadData()
      )
      .subscribe();
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setProgress(5);
    try {
      await modelService.triggerRetraining(currentOrganization.id);
      startProgressSimulation();
    } catch (error) {
      console.error(error);
      setIsRetraining(false);
    }
  };

  const startProgressSimulation = () => {
    setIsRetraining(true);
    let p = 5;
    const interval = setInterval(() => {
      p += 10;
      if (p >= 100) {
        clearInterval(interval);
        setIsRetraining(false);
        setProgress(0);
        loadData(); // Reload to see new version
      } else {
        setProgress(p);
      }
    }, 500);
  };

  const activeModel = versions.find(v => v.status === 'active') || versions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Current Model Card */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a] lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#8b5cf6]" />
                Active Model Performance
              </CardTitle>
              <CardDescription className="text-[#7a7a9a]">
                {activeModel ? `Version ${activeModel.version_number} • Deployed ${new Date(activeModel.training_date).toLocaleDateString()}` : 'No active model'}
              </CardDescription>
            </div>
            {activeModel && <Badge className="bg-green-500/20 text-green-400 border-green-500/50">ACTIVE</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricBox label="Accuracy" value={`${activeModel?.accuracy_score || 0}%`} />
            <MetricBox label="Precision" value={`${activeModel?.precision_score || 0}%`} />
            <MetricBox label="Recall" value={`${activeModel?.recall_score || 0}%`} />
            <MetricBox label="F1 Score" value={`${activeModel?.f1_score || 0}%`} />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-[#7a7a9a]">
              <span>Training Dataset Size</span>
              <span className="text-white font-mono">{activeModel?.dataset_size?.toLocaleString()} records</span>
            </div>
            <div className="h-2 bg-[#252541] rounded-full overflow-hidden">
              <div className="h-full bg-[#8b5cf6]" style={{ width: '85%' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retraining Controls */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white">Model Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[#252541] p-4 rounded-lg border border-[#3a3a5a]">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" /> Auto-Retraining
            </h4>
            <p className="text-xs text-[#7a7a9a] mb-3">Scheduled: Weekly (Sundays 02:00 UTC)</p>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">ENABLED</Badge>
          </div>

          <div className="space-y-2">
            {isRetraining ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white">
                  <span>Training in progress...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[#252541]" />
              </div>
            ) : (
              <Button 
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                onClick={handleRetrain}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Trigger Manual Retraining
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a] lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-white">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded bg-[#252541] border border-[#3a3a5a] hover:border-[#8b5cf6]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${v.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/20 text-gray-500'}`}>
                    {v.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-white font-mono font-medium">{v.version_number}</p>
                    <p className="text-[#7a7a9a] text-xs">{new Date(v.training_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-[#7a7a9a] text-xs">Acc</p>
                    <p className="text-white font-bold">{v.accuracy_score}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#7a7a9a] text-xs">F1</p>
                    <p className="text-white font-bold">{v.f1_score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="bg-[#252541] p-3 rounded-lg border border-[#3a3a5a] text-center">
      <p className="text-[#7a7a9a] text-xs uppercase mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  );
}