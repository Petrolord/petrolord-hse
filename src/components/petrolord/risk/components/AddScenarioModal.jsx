import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { riskService } from '@/services/riskService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export const PROBABILITIES = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const TYPES = ['Operational', 'Financial', 'Environmental', 'Security', 'Strategic', 'Black Swan'];

const emptyForm = () => ({ title: '', description: '', type: 'Operational', probability: 'Possible', impact_financial: '' });

export default function AddScenarioModal({ isOpen, onClose, onSuccess, record }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = !!record;

  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        title: record.title || '',
        description: record.description || '',
        type: record.type || 'Operational',
        probability: record.probability || 'Possible',
        impact_financial: record.impact_financial ?? '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [record, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        type: form.type,
        probability: form.probability,
        impact_financial: form.impact_financial === '' ? null : Number(form.impact_financial),
      };
      if (isEdit) {
        await riskService.updateScenario(record.id, payload);
      } else {
        await riskService.createScenario({ org_id: currentOrganization.id, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Scenario updated." : "Scenario added to the model." });
      setForm(emptyForm());
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'add'} scenario.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1e30] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Scenario' : 'Add Scenario'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Scenario Title *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" required placeholder="e.g. Extended Pipeline Shutdown" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" placeholder="What unfolds in this scenario?" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Probability</Label>
              <Select value={form.probability} onValueChange={v => set('probability', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {PROBABILITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Financial Impact ($)</Label>
              <Input type="number" step="any" value={form.impact_financial} onChange={e => set('impact_financial', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? 'Save Changes' : 'Add Scenario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
