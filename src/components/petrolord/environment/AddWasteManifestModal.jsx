import React, { useEffect, useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

const defaultManifest = () => `WM-${new Date().getFullYear()}-${Math.floor(Date.now() % 100000).toString().padStart(5, '0')}`;

const emptyForm = () => ({
  manifest_number: defaultManifest(),
  waste_type: '',
  quantity: '',
  unit: 'tonnes',
  classification: 'Non-Hazardous',
  transporter: '',
  disposal_facility: '',
  disposal_date: '',
  status: 'Generated',
});

export default function AddWasteManifestModal({ isOpen, onClose, onSuccess, record }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = !!record;

  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        manifest_number: record.manifest_number || '',
        waste_type: record.waste_type || '',
        quantity: record.quantity ?? '',
        unit: record.unit || 'tonnes',
        classification: record.classification || 'Non-Hazardous',
        transporter: record.transporter || '',
        disposal_facility: record.disposal_facility || '',
        disposal_date: record.disposal_date ? record.disposal_date.slice(0, 10) : '',
        status: record.status || 'Generated',
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
        manifest_number: form.manifest_number,
        waste_type: form.waste_type,
        quantity: Number(form.quantity),
        unit: form.unit || null,
        classification: form.classification || null,
        transporter: form.transporter || null,
        disposal_facility: form.disposal_facility || null,
        disposal_date: form.disposal_date || null,
        status: form.status,
      };
      if (isEdit) {
        await environmentService.updateWasteManifest(record.id, payload);
      } else {
        await environmentService.createWasteManifest({ org_id: currentOrganization.id, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Waste manifest updated." : "Waste manifest recorded." });
      setForm(emptyForm());
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'record'} waste manifest.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Waste Manifest' : 'New Waste Manifest'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Manifest # *</Label>
              <Input value={form.manifest_number} onChange={e => set('manifest_number', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Waste Type *</Label>
              <Input value={form.waste_type} onChange={e => set('waste_type', e.target.value)} placeholder="e.g. Drill Cuttings" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" step="any" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="tonnes" />
            </div>
            <div className="space-y-2">
              <Label>Classification</Label>
              <Select value={form.classification} onValueChange={v => set('classification', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Non-Hazardous', 'Hazardous', 'Recyclable'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transporter</Label>
              <Input value={form.transporter} onChange={e => set('transporter', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Disposal Facility</Label>
              <Input value={form.disposal_facility} onChange={e => set('disposal_facility', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Disposal Date</Label>
              <Input type="date" value={form.disposal_date} onChange={e => set('disposal_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Generated', 'In Transit', 'Disposed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />} {isEdit ? 'Save Changes' : 'Save Manifest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
