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

const EMPTY = {
  permit_number: '', type: '', issuing_authority: '',
  issue_date: '', expiry_date: '', status: 'Active',
};

export default function AddPermitModal({ isOpen, onClose, onSuccess, record }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const isEdit = !!record;

  // Prefill from the record being edited (date inputs need YYYY-MM-DD).
  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      setForm({
        permit_number: record.permit_number || '',
        type: record.type || '',
        issuing_authority: record.issuing_authority || '',
        issue_date: record.issue_date ? record.issue_date.slice(0, 10) : '',
        expiry_date: record.expiry_date ? record.expiry_date.slice(0, 10) : '',
        status: record.status || 'Active',
      });
    } else {
      setForm(EMPTY);
    }
  }, [record, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        permit_number: form.permit_number,
        type: form.type,
        issuing_authority: form.issuing_authority || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        status: form.status,
      };
      if (isEdit) {
        await environmentService.updatePermit(record.id, payload);
      } else {
        await environmentService.createPermit({ org_id: currentOrganization.id, ...payload });
      }
      toast({ title: "Success", description: isEdit ? "Permit updated." : "Permit added to the register." });
      setForm(EMPTY);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${isEdit ? 'update' : 'add'} permit.`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Permit' : 'Add Permit'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Permit # *</Label>
              <Input value={form.permit_number} onChange={e => set('permit_number', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Type *</Label>
              <Input value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Air Emissions" className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Issuing Authority</Label>
            <Input value={form.issuing_authority} onChange={e => set('issuing_authority', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Issue Date</Label>
              <Input type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {['Active', 'Pending', 'Expired', 'Revoked'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? 'Save Changes' : 'Add Permit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
