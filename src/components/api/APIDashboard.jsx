import React, { useState, useEffect } from 'react';
import { integrationService } from '@/services/integrationService';
import { useHSE } from '@/context/HSEContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Key, Webhook, Activity, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function APIDashboard() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [keys, setKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // New Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState(null);

  useEffect(() => {
    if (currentOrganization) loadData();
  }, [currentOrganization]);

  const loadData = async () => {
    const [k, w, l] = await Promise.all([
      integrationService.getApiKeys(currentOrganization.id),
      integrationService.getWebhooks(currentOrganization.id),
      integrationService.getLogs(currentOrganization.id)
    ]);
    setKeys(k);
    setWebhooks(w);
    setLogs(l);
  };

  const handleCreateKey = async () => {
    if (!newKeyLabel) return;
    try {
      const result = await integrationService.createApiKey(currentOrganization.id, newKeyLabel, ['read:all']);
      setCreatedKey(result.rawKey);
      loadData();
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate key.", variant: "destructive" });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API Key copied to clipboard." });
  };

  return (
    <div className="p-6 bg-[var(--bg-app)] min-h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="h-8 w-8 text-pink-500" /> Developer API
          </h2>
          <p className="text-[#b0b0c0]">Connect Petrolord HSE with external systems</p>
        </div>
        <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0]">
          API Documentation
        </Button>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="bg-[#252541] border border-[#3a3a5a]">
          <TabsTrigger value="keys" className="text-[#b0b0c0]"><Key className="mr-2 h-4 w-4"/> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-[#b0b0c0]"><Webhook className="mr-2 h-4 w-4"/> Webhooks</TabsTrigger>
          <TabsTrigger value="logs" className="text-[#b0b0c0]"><Activity className="mr-2 h-4 w-4"/> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setIsKeyModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Generate New Key
            </Button>
          </div>
          
          {keys.map(k => (
            <Card key={k.id} className="bg-[#252541] border-[#3a3a5a]">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold">{k.label}</h4>
                  <p className="text-sm text-[#7a7a9a] font-mono">Prefix: {k.key_prefix}...</p>
                  <p className="text-xs text-[#5a5a7a] mt-1">Created: {new Date(k.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-900/20" onClick={() => integrationService.revokeKey(k.id).then(loadData)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {keys.length === 0 && <div className="text-center py-8 text-[#7a7a9a]">No API keys found.</div>}
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
           <div className="text-center py-12 border border-dashed border-[#3a3a5a] rounded-lg text-[#7a7a9a]">
             <Webhook className="h-12 w-12 mx-auto mb-4 opacity-20" />
             <p>No webhooks configured.</p>
             <Button variant="link" className="text-pink-400 mt-2">Configure Webhook</Button>
           </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
           <div className="bg-[#252541] rounded-lg border border-[#3a3a5a] overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-[#1a1a2e] text-[#7a7a9a]">
                 <tr><th className="p-4">Time</th><th className="p-4">Event</th><th className="p-4">Status</th></tr>
               </thead>
               <tbody className="divide-y divide-[#3a3a5a]">
                 {logs.length === 0 ? (
                   <tr><td colSpan={3} className="p-8 text-center text-[#7a7a9a]">No integration logs.</td></tr>
                 ) : logs.map(l => (
                   <tr key={l.id}><td className="p-4 text-[#7a7a9a]">{new Date(l.created_at).toLocaleString()}</td><td className="p-4 text-white">{l.event}</td><td className="p-4">{l.status}</td></tr>
                 ))}
               </tbody>
             </table>
           </div>
        </TabsContent>
      </Tabs>

      {/* New Key Modal */}
      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
        <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription className="text-[#b0b0c0]">Create a new key to access the API.</DialogDescription>
          </DialogHeader>
          
          {!createdKey ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-[#b0b0c0]">Key Label</label>
                <Input 
                  value={newKeyLabel} 
                  onChange={(e) => setNewKeyLabel(e.target.value)} 
                  placeholder="e.g. Production Server" 
                  className="bg-[#252541] border-[#3a3a5a] text-white"
                />
              </div>
              <Button onClick={handleCreateKey} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Generate</Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-yellow-400 text-xs">
                Copy this key now. You won't be able to see it again!
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#000] p-3 rounded text-green-400 font-mono text-sm break-all">
                  {createdKey}
                </code>
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => { setIsKeyModalOpen(false); setCreatedKey(null); setNewKeyLabel(""); }} className="w-full" variant="secondary">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}