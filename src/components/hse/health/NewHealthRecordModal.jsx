import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { healthService } from '@/services/healthService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewHealthRecordModal({ isOpen, onClose, onSuccess, users }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    record_type: '',
    status: 'pending',
    details: '',
    notes: '',
    created_at: new Date().toISOString().split('T')[0]
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.record_type) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        org_id: currentOrganization.id,
        user_id: formData.user_id,
        record_type: formData.record_type,
        status: formData.status,
        details: {
          description: formData.details,
          notes: formData.notes
        },
        created_by: currentUser.id,
        created_at: new Date(formData.created_at).toISOString()
      };

      await healthService.createHealthRecord(payload);
      toast({ title: "Success", description: "Health record created successfully." });
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        user_id: '',
        record_type: '',
        status: 'pending',
        details: '',
        notes: '',
        created_at: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Creation error:", error);
      toast({ title: "Error", description: "Failed to create health record.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader>
          <DialogTitle>New Health Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Employee *</Label>
              <Select value={formData.user_id} onValueChange={(val) => handleChange('user_id', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.raw_user_meta_data?.full_name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Record Type *</Label>
              <Select value={formData.record_type} onValueChange={(val) => handleChange('record_type', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="Fitness to Work">Fitness to Work</SelectItem>
                  <SelectItem value="Exposure">Exposure</SelectItem>
                  <SelectItem value="Medical Incident">Medical Incident</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Clinic Visit">Clinic Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Date</Label>
              <Input 
                type="date" 
                value={formData.created_at} 
                onChange={(e) => handleChange('created_at', e.target.value)}
                className="bg-[#252541] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fit">Fit</SelectItem>
                  <SelectItem value="unfit">Unfit</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Details</Label>
            <Textarea 
              value={formData.details} 
              onChange={(e) => handleChange('details', e.target.value)}
              placeholder="Enter specific medical details..."
              className="bg-[#252541] border-[#3a3a5a] text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Notes</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="bg-[#252541] border-[#3a3a5a] text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}