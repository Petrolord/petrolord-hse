import React, { useState, useEffect } from 'react';
import { workflowService } from '@/services/workflowService';
import { useHSE } from '@/context/HSEContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GitBranch, Play, Plus, History, Settings2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function WorkflowDashboard() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    const [wfs, execs] = await Promise.all([
      workflowService.getWorkflows(currentOrganization.id),
      workflowService.getExecutions(currentOrganization.id)
    ]);
    setWorkflows(wfs);
    setExecutions(execs);
  };

  const templates = workflowService.getTemplates();

  return (
    <div className="p-6 bg-[var(--bg-app)] min-h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-orange-500" /> Automation
          </h2>
          <p className="text-[#b0b0c0]">Streamline safety processes and notifications</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="active" className="text-[#b0b0c0]">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates" className="text-[#b0b0c0]">Templates</TabsTrigger>
          <TabsTrigger value="history" className="text-[#b0b0c0]">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {workflows.length === 0 ? (
            <div className="text-center py-12 text-[#7a7a9a] border border-dashed border-[#3a3a5a] rounded-lg">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active workflows. Create one from a template!</p>
            </div>
          ) : (
            workflows.map(wf => (
              <Card key={wf.id} className="bg-[#252541] border-[#3a3a5a]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{wf.name}</h3>
                    <p className="text-sm text-[#7a7a9a]">{wf.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${wf.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {wf.is_active ? 'Running' : 'Paused'}
                    </span>
                    <Button variant="ghost" size="sm"><Settings2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <Card key={t.id} className="bg-[#252541] border-[#3a3a5a] hover:border-orange-500/50 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-orange-500/10 rounded-lg w-fit group-hover:bg-orange-500/20 transition-colors">
                  <Play className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-white font-bold mb-2">{t.name}</h3>
                <p className="text-sm text-[#b0b0c0] mb-4">{t.description}</p>
                <div className="text-xs text-[#7a7a9a] bg-[#1a1a2e] px-2 py-1 rounded w-fit">
                  Trigger: {t.trigger}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Workflow</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a3a5a]">
                  {executions.map(ex => (
                    <tr key={ex.id} className="hover:bg-[#2d2d4a]">
                      <td className="px-6 py-4 text-white">{ex.workflow?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 ${ex.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {ex.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {ex.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#7a7a9a]">{new Date(ex.started_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-[#7a7a9a]">240ms</td>
                    </tr>
                  ))}
                  {executions.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-[#7a7a9a]">No execution history.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}