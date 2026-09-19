import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { modelService } from '@/services/modelService';
import { useHSE } from '@/context/HSEContext';
import { CheckCircle, Clock, Brain } from 'lucide-react';

const pct = (v) => (v === null || v === undefined || v === '' ? '--' : `${v}%`);

export default function ModelRetrainingPanel() {
  const { currentOrganization } = useHSE();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      setLoading(true);
      modelService.getModelVersions(currentOrganization.id)
        .then(setVersions)
        .finally(() => setLoading(false));
    }
  }, [currentOrganization]);

  if (loading) return <div className="p-8 text-center text-[#7a7a9a]">Loading model records...</div>;

  if (versions.length === 0) {
    return (
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-10 text-center text-[#7a7a9a]">
          <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-white font-medium">No model data yet</p>
          <p className="text-sm mt-1">No predictive model has been trained for your organization, so there are no performance figures to show.</p>
        </CardContent>
      </Card>
    );
  }

  const activeModel = versions.find(v => v.status === 'active') || versions[0];

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#8b5cf6]" />
                Recorded Model Performance
              </CardTitle>
              <CardDescription className="text-[#7a7a9a]">
                {`Version ${activeModel.version_number}${activeModel.training_date ? ` • Trained ${new Date(activeModel.training_date).toLocaleDateString()}` : ''}`}
              </CardDescription>
            </div>
            {activeModel.status === 'active' && <Badge className="bg-green-500/20 text-green-400 border-green-500/50">ACTIVE</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricBox label="Accuracy" value={pct(activeModel.accuracy_score)} />
            <MetricBox label="Precision" value={pct(activeModel.precision_score)} />
            <MetricBox label="Recall" value={pct(activeModel.recall_score)} />
            <MetricBox label="F1 Score" value={pct(activeModel.f1_score)} />
          </div>
          {activeModel.dataset_size != null && (
            <div className="flex justify-between text-sm text-[#7a7a9a]">
              <span>Training Dataset Size</span>
              <span className="text-white font-mono">{Number(activeModel.dataset_size).toLocaleString()} records</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded bg-[#252541] border border-[#3a3a5a]">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${v.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/20 text-gray-500'}`}>
                    {v.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-white font-mono font-medium">{v.version_number}</p>
                    {v.training_date && <p className="text-[#7a7a9a] text-xs">{new Date(v.training_date).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-[#7a7a9a] text-xs">Acc</p>
                    <p className="text-white font-bold">{pct(v.accuracy_score)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#7a7a9a] text-xs">F1</p>
                    <p className="text-white font-bold">{v.f1_score ?? '--'}</p>
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
