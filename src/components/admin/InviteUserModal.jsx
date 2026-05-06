import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { inviteUserService } from '@/services/inviteUserService';
import { supabase } from '@/lib/customSupabaseClient';

export default function InviteUserModal({ isOpen, onClose, orgId, onInviteSent }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    department_id: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && orgId) {
      fetchDepartments();
    }
  }, [isOpen, orgId]);

  const fetchDepartments = async () => {
    try {
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('org_id', orgId);
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.role) newErrors.role = "Please select a role.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const invite = await inviteUserService.createInvitation({
        org_id: orgId,
        ...formData
      });

      // Simulation of email sending (Since we don't have a real SMTP backend configured in this env)
      // In a real production app, this would be an Edge Function call.
      console.log(`[Mock Email] Sending invite to ${formData.email} with token ${invite.token}`);
      
      const inviteLink = `${window.location.origin}/accept-invite/${invite.token}`;
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${formData.email}.`,
        duration: 5000,
      });

      // Copy link to clipboard for convenience in this demo environment
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard (Demo Mode).",
        variant: "secondary"
      });

      if (onInviteSent) onInviteSent();
      onClose();
      setFormData({ email: '', first_name: '', last_name: '', role: '', department_id: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription className="text-[#b0b0c0]">
            Send an invitation to join your organization. They will receive an email with a link to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[#b0b0c0]">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="bg-[#252541] border-[#3a3a5a] text-white"
                placeholder="John"
              />
              {errors.first_name && <p className="text-red-400 text-xs">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[#b0b0c0]">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="bg-[#252541] border-[#3a3a5a] text-white"
                placeholder="Doe"
              />
              {errors.last_name && <p className="text-red-400 text-xs">{errors.last_name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#b0b0c0]">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-[#252541] border-[#3a3a5a] text-white"
              placeholder="john.doe@company.com"
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#b0b0c0]">Role</Label>
              <Select 
                value={formData.role}
                onValueChange={(val) => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                  <SelectItem value="hse_coordinator">HSE Coordinator</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-400 text-xs">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-[#b0b0c0]">Department</Label>
              <Select
                value={formData.department_id}
                onValueChange={(val) => setFormData({...formData, department_id: val})}
              >
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>The user will receive an email containing a secure link to accept the invitation and set their password.</p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="petrolord-button">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}