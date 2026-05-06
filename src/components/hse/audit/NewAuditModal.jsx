import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { auditService } from '@/services/auditService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewAuditModal({ isOpen, onClose, onSuccess, sites, users }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    audit_type: 'Internal',
    scheduled_date: '',
    auditor_id: '',
    location_id: '',
    priority: 'Medium',
    scope: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auditService.createScheduledAudit({
        org_id: currentOrganization.id,
        audit_id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Audit scheduled successfully." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to schedule audit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Schedule New Audit</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Audit Type</Label>
              <Select value={formData.audit_type} onValueChange={v => setFormData({...formData, audit_type: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['Internal','Contractor','Site','System'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Scheduled Date</Label>
              <Input type="date" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Location</Label>
              <Select value={formData.location_id} onValueChange={v => setFormData({...formData, location_id: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Auditor</Label>
              <Select value={formData.auditor_id} onValueChange={v => setFormData({...formData, auditor_id: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Auditor" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.raw_user_meta_data?.full_name || u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Scope / Notes</Label>
            <Input value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}