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

const STRATEGIES = ['Avoid', 'Reduce', 'Transfer', 'Accept'];
const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

const emptyForm = () => ({
  risk_id: '', description: '', strategy: 'Reduce', status: 'Not Started',
  due_date: '', progress: '0', budget: '', spent: '',
});

export default function AddMitigationModal({ isOpen, onClose, onSuccess, risks = [], defaultRiskId, record }) {
  const { currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm(), risk_id: defaultRiskId || '' });
  const isEdit = !!record;

  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        risk_id: record.risk_id || '',
        description: record.description || '',
        strategy: record.strategy || 'Reduce',
        status: record.status || 'Not Started',
        due_date: record.due_date ? record.due_date.slice(0, 10) : '',
        progress: record.progress != null ? String(record.progress) : '0',
        budget: record.budget ?? '',
        spent: record.spent ?? '',
      });
    } else {
      setForm({ ...emptyForm(), risk_id: defaultRiskId || '' });
    }
  }, [record, isOpen, defaultRiskId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.risk_id) {
      toast({ title: "Select a risk", description: "A mitigation action must be linked to a risk.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        description: form.description,
        strategy: form.strategy,
        status: form.status,
        due_date: form.due_date || null,
        progress: form.progress === '' ? 0 : Number(form.progress),
        budget: form.budget === '' ? null : Number(form.budget),
        spent: form.spent === '' ? null : Number(form.spent),
      };
      if (isEdit) {
        await riskService.updateMitigation(record.id, payload);
      } else {
        await riskService.createMitigation({ risk_id: form.risk_id, owner_id: currentUser?.id || null, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Mitigation action updated." : "Mitigation action added." });
      setForm({ ...emptyForm(), risk_id: defaultRiskId || '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'add'} mitigation action.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] bg-[#1e1e30] border-[#3a3a5a] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Mitigation Action' : 'Add Mitigation Action'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Risk *</Label>
            <Select value={form.risk_id} onValueChange={v => set('risk_id', v)} disabled={!!defaultRiskId || isEdit}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a]"><SelectValue placeholder="Link to a risk" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white max-h-64">
                {risks.map(r => <SelectItem key={r.id} value={r.id}>{r.risk_id} — {r.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Action Description *</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" required placeholder="What will be done to treat this risk?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Strategy</Label>
              <Select value={form.strategy} onValueChange={v => set('strategy', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {STRATEGIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" />
            </div>
            <div className="space-y-2">
              <Label>Progress (%)</Label>
              <Input type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input type="number" step="any" value={form.budget} onChange={e => set('budget', e.target.value)} className="bg-[#252541] border-[#3a3a5a]" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? 'Save Changes' : 'Add Action'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
