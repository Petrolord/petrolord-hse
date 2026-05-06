import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { securityService } from '@/services/securityService';
import { incidentService } from '@/services/incidentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function LogSecurityIncidentModal({ isOpen, onClose, onSuccess, users, sites }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    incident_code: `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
    type: '',
    severity: '',
    location_id: '',
    description: '',
    assigned_to: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0,5),
    status: 'Reported'
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.severity) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const payload = {
        organization_id: currentOrganization.id,
        incident_code: formData.incident_code,
        title: formData.title,
        type: formData.type,
        severity: formData.severity,
        location_id: formData.location_id || null,
        description: formData.description,
        assigned_to: formData.assigned_to || null,
        incident_date: dateTime.toISOString(),
        status: formData.status,
        created_by: currentUser.id
      };

      await incidentService.createIncident(payload);
      toast({ title: "Success", description: "Security incident logged successfully." });
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        incident_code: `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: '',
        severity: '',
        location_id: '',
        description: '',
        assigned_to: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0,5),
        status: 'Reported'
      });
    } catch (error) {
      console.error("Creation error:", error);
      toast({ title: "Error", description: "Failed to log incident.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader>
          <DialogTitle>Log Security Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Title *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Brief title"
                className="bg-[#252541] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Incident ID</Label>
              <Input 
                value={formData.incident_code} 
                disabled
                className="bg-[#141423] border-[#3a3a5a] text-gray-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Type *</Label>
              <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="Unauthorized Access">Unauthorized Access</SelectItem>
                  <SelectItem value="Theft">Theft/Loss</SelectItem>
                  <SelectItem value="Data Breach">Data Breach</SelectItem>
                  <SelectItem value="Physical Security">Physical Security</SelectItem>
                  <SelectItem value="Cyber Threat">Cyber Threat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Severity *</Label>
              <Select value={formData.severity} onValueChange={(val) => handleChange('severity', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Severity" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Date</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={(e) => handleChange('date', e.target.value)}
                className="bg-[#252541] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Time</Label>
              <Input 
                type="time" 
                value={formData.time} 
                onChange={(e) => handleChange('time', e.target.value)}
                className="bg-[#252541] border-[#3a3a5a] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What happened? Include as much detail as possible..."
              className="bg-[#252541] border-[#3a3a5a] text-white min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0] hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}