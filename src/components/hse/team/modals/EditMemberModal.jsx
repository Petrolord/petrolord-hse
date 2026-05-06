import React, { useState, useEffect } from 'react';
import { teamService } from '@/services/teamService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function EditMemberModal({ isOpen, onClose, onSuccess, member, teams, roles }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', role_id: '', team_id: null 
  });

  useEffect(() => {
      if (member) {
          setFormData({
              first_name: member.first_name || '',
              last_name: member.last_name || '',
              role_id: member.role?.id || member.role_raw || '',
              team_id: member.team?.id || null
          });
      }
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await teamService.updateMember(member.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role_id,
          team_id: formData.team_id
      }, member.type);
      
      toast({ title: "Updated", description: "Member details updated." });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Edit Member Details</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">First Name</Label>
              <Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Last Name</Label>
              <Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Team</Label>
            <Select
              value={formData.team_id || 'unassigned'} 
              onValueChange={v => setFormData({...formData, team_id: v === 'unassigned' ? null : v})}
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
            <Select value={formData.role_id} onValueChange={v => setFormData({...formData, role_id: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.role_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}