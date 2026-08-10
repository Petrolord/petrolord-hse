import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  parameter: '', value: '', unit: '', limit_value: '',
  location_point: '', sample_date: today(),
});

// Compliant when the measured value is at/below the regulatory limit.
const computeStatus = (value, limit) => {
  if (value === '' || limit === '') return 'Recorded';
  return Number(value) <= Number(limit) ? 'Compliant' : 'Exceedance';
};

export default function SubmitMonitoringModal({ isOpen, onClose, onSuccess, record }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = !!record;

  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        parameter: record.parameter || '',
        value: record.value ?? '',
        unit: record.unit || '',
        limit_value: record.limit_value ?? '',
        location_point: record.location_point || '',
        sample_date: record.sample_date ? record.sample_date.slice(0, 10) : today(),
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
        parameter: form.parameter,
        value: Number(form.value),
        unit: form.unit,
        limit_value: form.limit_value === '' ? null : Number(form.limit_value),
        location_point: form.location_point || null,
        sample_date: form.sample_date,
        status: computeStatus(form.value, form.limit_value),
      };
      if (isEdit) {
        await environmentService.updateMonitoringData(record.id, payload);
      } else {
        await environmentService.logMonitoringData({ org_id: currentOrganization.id, created_by: currentUser?.id || null, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Monitoring sample updated." : "Monitoring sample recorded." });
      setForm(emptyForm());
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'record'} monitoring data.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Monitoring Sample' : 'Submit Monitoring Data'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Parameter *</Label>
              <Input value={form.parameter} onChange={e => set('parameter', e.target.value)} placeholder="e.g. pH, Oil & Grease" className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Sample Date *</Label>
              <Input type="date" value={form.sample_date} onChange={e => set('sample_date', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Value *</Label>
              <Input type="number" step="any" value={form.value} onChange={e => set('value', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Unit *</Label>
              <Input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="mg/l" className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Limit</Label>
              <Input type="number" step="any" value={form.limit_value} onChange={e => set('limit_value', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Location</Label>
            <Input value={form.location_point} onChange={e => set('location_point', e.target.value)} placeholder="e.g. Outfall 1" className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          {form.value !== '' && form.limit_value !== '' && (
            <p className={`text-xs ${computeStatus(form.value, form.limit_value) === 'Compliant' ? 'text-green-400' : 'text-red-400'}`}>
              Status will be recorded as: {computeStatus(form.value, form.limit_value)}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? 'Save Changes' : 'Save Sample'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
