import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { teamService } from '@/services/teamService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';

export default function NewTeamModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    team_name: '', description: '', budget: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!formData.team_name.trim()) {
        setErrorMsg("Team Name is required.");
        setLoading(false);
        return;
    }

    try {
      if (!currentOrganization?.id || !currentUser?.id) {
          throw new Error("Missing organization or user context.");
      }

      await teamService.createTeam({
        org_id: currentOrganization.id,
        team_id: `TM-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        department: null, // Department field removed/deprecated
        budget: parseFloat(formData.budget) || 0,
        created_by: currentUser.id
      });
      
      toast({ title: "Success", description: "Team created successfully." });
      setFormData({ team_name: '', description: '', budget: '' }); // Reset form
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Create Team Error:", error);
      const msg = error.message || "Failed to create team. Please try again.";
      setErrorMsg(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
        
        {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Team Name *</Label>
            <Input 
                value={formData.team_name} 
                onChange={e => setFormData({...formData, team_name: e.target.value})} 
                className="bg-[#252541] border-[#3a3a5a] text-white" 
                placeholder="e.g. Operations Alpha"
                required 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Budget Allocation ($)</Label>
            <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" placeholder="Purpose of this team..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}