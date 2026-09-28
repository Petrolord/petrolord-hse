import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);
const defaultSpillId = () => `SP-${new Date().getFullYear()}-${Math.floor(Date.now() % 100000).toString().padStart(5, '0')}`;

const emptyForm = () => ({
  spill_id: defaultSpillId(),
  incident_date: today(),
  substance: '',
  quantity_spilled: '',
  quantity_recovered: '',
  unit: 'bbl',
  severity: 'Minor',
  status: 'Open',
  location_text: '',
  remediation_plan: '',
});

export default function LogSpillModal({ isOpen, onClose, onSuccess, record }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = !!record;

  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        spill_id: record.spill_id || '',
        incident_date: record.incident_date ? record.incident_date.slice(0, 10) : today(),
        substance: record.substance || '',
        quantity_spilled: record.quantity_spilled ?? '',
        quantity_recovered: record.quantity_recovered ?? '',
        unit: record.unit || 'bbl',
        severity: record.severity || 'Minor',
        status: record.status || 'Open',
        location_text: record.location_text || '',
        remediation_plan: record.remediation_plan || '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [record, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        spill_id: form.spill_id,
        incident_date: form.incident_date,
        substance: form.substance || null,
        quantity_spilled: form.quantity_spilled === '' ? null : Number(form.quantity_spilled),
        quantity_recovered: form.quantity_recovered === '' ? null : Number(form.quantity_recovered),
        unit: form.unit || null,
        severity: form.severity,
        status: form.status,
        location_text: form.location_text || null,
        remediation_plan: form.remediation_plan || null,
      };
      if (isEdit) {
        await environmentService.updateSpillReport(record.id, payload);
      } else {
        await environmentService.createSpillReport({ org_id: currentOrganization.id, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Spill incident updated." : "Spill incident logged." });
      setForm(emptyForm());
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'log'} spill incident.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Spill Incident' : 'Log New Spill'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Spill ID *</Label>
              <Input value={form.spill_id} onChange={e => set('spill_id', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Incident Date *</Label>
              <Input type="date" value={form.incident_date} onChange={e => set('incident_date', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Substance</Label>
            <Input value={form.substance} onChange={e => set('substance', e.target.value)} placeholder="e.g. Crude Oil" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Qty Spilled</Label>
              <Input type="number" step="any" value={form.quantity_spilled} onChange={e => set('quantity_spilled', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Qty Recovered</Label>
              <Input type="number" step="any" value={form.quantity_recovered} onChange={e => set('quantity_recovered', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="bbl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => set('severity', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Minor', 'Moderate', 'Major', 'Critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Open', 'Under Remediation', 'Closed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location_text} onChange={e => set('location_text', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Remediation Plan</Label>
            <Textarea value={form.remediation_plan} onChange={e => set('remediation_plan', e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />} {isEdit ? 'Save Changes' : 'Log Spill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
