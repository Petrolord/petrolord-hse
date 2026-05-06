import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { teamService } from '@/services/teamService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewMemberModal({ isOpen, onClose, onSuccess, teams, roles }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', role_id: '', team_id: null 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      console.log("Modal: Submitting invitation...");
      await teamService.inviteMember(
        formData.email,
        formData.role_id,
        formData.team_id,
        currentOrganization.id,
        formData.first_name,
        formData.last_name
      );
      
      toast({ 
        title: "Invitation Sent", 
        description: `Successfully sent invitation email to ${formData.email}.`,
        className: "bg-green-600 border-green-700 text-white" 
      });
      
      setFormData({ first_name: '', last_name: '', email: '', role_id: '', team_id: null });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Modal: Error caught during submission:", error);
      
      let displayMsg = "Failed to send invitation.";
      if (error.message.includes("Database Error")) {
        displayMsg = "Database error: Could not save invitation record. Check permissions.";
      } else if (error.message.includes("Email Service")) {
        displayMsg = "Invitation saved, but EMAIL FAILED to send. Please try 'Resend' later.";
      } else if (error.message.includes("duplicate")) {
        displayMsg = "This user has already been invited or is already a member.";
      }

      setErrorMsg(displayMsg);
      toast({ 
        title: "Error", 
        description: displayMsg, 
        variant: "destructive" 
      });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!loading) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
        
        {errorMsg && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">First Name *</Label>
              <Input 
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
                className="bg-[#252541] border-[#3a3a5a] text-white focus:border-blue-500" 
                required 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Last Name *</Label>
              <Input 
                value={formData.last_name} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
                className="bg-[#252541] border-[#3a3a5a] text-white focus:border-blue-500" 
                required 
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Email *</Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="bg-[#252541] border-[#3a3a5a] text-white focus:border-blue-500" 
              required 
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Team</Label>
            <Select
              value={formData.team_id || 'unassigned'} 
              onValueChange={v => setFormData({...formData, team_id: v === 'unassigned' ? null : v})}
              disabled={loading}
            >
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Team" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                <SelectItem value="unassigned">No Team</SelectItem>
                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Role</Label>
            <Select 
              value={formData.role_id} 
              onValueChange={v => setFormData({...formData, role_id: v})}
              disabled={loading}
            >
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.role_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]" disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}