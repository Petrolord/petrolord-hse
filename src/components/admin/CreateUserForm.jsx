import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Key } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export default function CreateUserForm({ initialData, onSuccess, onCancel }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    user_id: '', 
    user_role: 'staff_admin',
    organization_id: '',
    modules: ['HSE']
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadOrgs();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        user_id: initialData.user_id,
        user_role: initialData.user_role || 'staff_admin',
        organization_id: initialData.organization_id,
        modules: initialData.modules || ['HSE']
      });
    }
  }, [initialData]);

  const loadOrgs = async () => {
    try {
      const data = await adminService.getOrganizations();
      setOrganizations(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.organization_id) newErrors.organization_id = "Organization is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      let finalUserId = formData.user_id;

      // 1. If we are creating a new user (no initialData or no pre-filled ID), create via Edge Function
      if (!initialData?.id) {
        // Call Edge Function to create Auth User
        const { data: result, error: fnError } = await supabase.functions.invoke('admin-create-user', {
          body: {
            email: formData.email,
            name: formData.name,
            role: formData.user_role
          }
        });

        if (fnError) throw new Error(fnError.message || "Failed to create authentication user.");
        if (result?.error) throw new Error(result.error);
        
        finalUserId = result.user_id;
      }

      // 2. Create or Update DB Record
      if (initialData?.id) {
        await adminService.updateUserRecord(initialData.id, {
            user_role: formData.user_role,
            organization_id: formData.organization_id
        });
        toast({ title: "Success", description: "User record updated." });
      } else {
        const payload = {
            user_id: finalUserId,
            organization_id: formData.organization_id,
            user_role: formData.user_role,
            modules: formData.modules,
            created_at: new Date()
        };
        
        await adminService.createUserRecord(payload);
        toast({ 
          title: "User Created", 
          description: `User created and welcome email sent to ${formData.email}.` 
        });
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to process user.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* 1. Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#b0b0c0]">Full Name <span className="text-red-400">*</span></Label>
        <Input 
          id="name" 
          placeholder="e.g. John Doe" 
          className={`bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] ${errors.name ? 'border-red-500' : ''}`}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          disabled={!!initialData?.id} // Disable name edit if updating record only
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
      </div>

      {/* 2. Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#b0b0c0]">Email Address <span className="text-red-400">*</span></Label>
        <Input 
          id="email" 
          type="email"
          placeholder="e.g. john@company.com" 
          className={`bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] ${errors.email ? 'border-red-500' : ''}`}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          disabled={!!initialData?.id} // Disable email edit if updating record only
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      {/* 3. UUID (Read Only / Optional) */}
      <div className="space-y-2">
        <Label htmlFor="user_id_input" className="text-[#b0b0c0]">User ID (UUID)</Label>
        <div className="relative">
          <Input 
            id="user_id_input" 
            placeholder={initialData?.id ? formData.user_id : "Auto-generated upon creation"} 
            className="bg-[#1a1a2e] border-[#3a3a5a] text-[#7a7a9a] pr-10"
            value={formData.user_id}
            readOnly
            onChange={(e) => setFormData({...formData, user_id: e.target.value})}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a5a]">
            <Key className="h-4 w-4" />
          </div>
        </div>
        {!initialData && (
          <p className="text-xs text-[#5a5a7a]">
            This ID will be automatically generated by the Authentication system.
          </p>
        )}
      </div>

      {/* 4. System Role */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-[#b0b0c0]">System Role</Label>
        <Select 
          value={formData.user_role} 
          onValueChange={(val) => setFormData({...formData, user_role: val})}
        >
          <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            <SelectItem value="org_admin">Organization Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="staff_admin">Staff</SelectItem>
            <SelectItem value="consultant">Consultant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. Assign Organization */}
       <div className="space-y-2">
        <Label htmlFor="org" className="text-[#b0b0c0]">Assign Organization <span className="text-red-400">*</span></Label>
        <Select 
          value={formData.organization_id} 
          onValueChange={(val) => setFormData({...formData, organization_id: val})}
        >
          <SelectTrigger className={`bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0] ${errors.organization_id ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
            {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.organization_id && <p className="text-xs text-red-400">{errors.organization_id}</p>}
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" className="text-[#b0b0c0]" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="petrolord-button" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update User' : 'Add User Record'}
        </Button>
      </div>
    </form>
  );
}