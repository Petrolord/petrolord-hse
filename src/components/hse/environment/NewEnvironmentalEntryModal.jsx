import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewEnvironmentalEntryModal({ isOpen, onClose, onSuccess, sites }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    record_type: '',
    location_id: '',
    measurement_value: '',
    unit: '',
    measurement_date: new Date().toISOString().split('T')[0],
    status: 'compliant',
    details: ''
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.record_type || !formData.measurement_value || !formData.unit) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        org_id: currentOrganization.id,
        record_type: formData.record_type,
        location_id: formData.location_id || null,
        measurement_value: parseFloat(formData.measurement_value),
        unit: formData.unit,
        measurement_date: new Date(formData.measurement_date).toISOString(),
        status: formData.status,
        details: { comments: formData.details },
        created_by: currentUser.id
      };

      await environmentService.createEnvironmentalRecord(payload);
      toast({ title: "Success", description: "Environmental record created successfully." });
      onSuccess();
      onClose();
      // Reset
      setFormData({
        record_type: '',
        location_id: '',
        measurement_value: '',
        unit: '',
        measurement_date: new Date().toISOString().split('T')[0],
        status: 'compliant',
        details: ''
      });
    } catch (error) {
      console.error("Creation error:", error);
      toast({ title: "Error", description: "Failed to create record.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader>
          <DialogTitle>New Environmental Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Record Type *</Label>
              <Select value={formData.record_type} onValueChange={(val) => handleChange('record_type', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="Air Quality">Air Quality</SelectItem>
                  <SelectItem value="Water Quality">Water Quality</SelectItem>
                  <SelectItem value="Soil Quality">Soil Quality</SelectItem>
                  <SelectItem value="Waste">Waste</SelectItem>
                  <SelectItem value="Emissions">Emissions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Location</Label>
              <Select value={formData.location_id} onValueChange={(val) => handleChange('location_id', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {sites.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Measurement Value *</Label>
              <Input 
                type="number" 
                step="any"
                value={formData.measurement_value} 
                onChange={(e) => handleChange('measurement_value', e.target.value)}
                className="bg-[#252541] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Unit *</Label>
              <Select value={formData.unit} onValueChange={(val) => handleChange('unit', val)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="ppm">ppm</SelectItem>
                  <SelectItem value="mg/L">mg/L</SelectItem>
                  <SelectItem value="ug/m3">ug/m3</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="dB">dB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Date</Label>
              <Input 
                type="date" 
                value={formData.measurement_date} 
                onChange={(e) => handleChange('measurement_date', e.target.value)}
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
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Details</Label>
            <Textarea 
              value={formData.details} 
              onChange={(e) => handleChange('details', e.target.value)}
              placeholder="Additional information..."
              className="bg-[#252541] border-[#3a3a5a] text-white min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}