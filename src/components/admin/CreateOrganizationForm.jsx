import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';

export default function CreateOrganizationForm({ initialData, onSuccess, onCancel }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    subscription_tier: 'free',
    hse_enabled: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contact_email: initialData.contact_email || '',
        subscription_tier: initialData.subscription_tier || 'free',
        hse_enabled: initialData.hse_enabled ?? true
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await adminService.updateOrganization(initialData.id, formData);
        toast({ title: "Success", description: "Organization updated successfully." });
      } else {
        await adminService.createOrganization(formData);
        toast({ title: "Success", description: "Organization created successfully." });
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save organization.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#b0b0c0]">Organization Name</Label>
        <Input 
          id="name" 
          placeholder="e.g. Acme Corp" 
          className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact_email" className="text-[#b0b0c0]">Contact Email</Label>
        <Input 
          id="contact_email" 
          type="email" 
          placeholder="contact@acme.com" 
          className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]"
          value={formData.contact_email}
          onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan" className="text-[#b0b0c0]">Subscription Plan</Label>
        <Select 
          value={formData.subscription_tier} 
          onValueChange={(val) => setFormData({...formData, subscription_tier: val})}
        >
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="free">Free Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" className="text-[#b0b0c0]" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="petrolord-button" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
}