import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { organizationUsersService } from '@/services/organizationUsersService';
import { quickReportService } from '@/services/quickReportService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, report, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen && currentOrganization) {
      loadUsers();
    }
  }, [isOpen, currentOrganization]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await organizationUsersService.fetchOrganizationUsersEnriched(currentOrganization.id);
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await quickReportService.assignReport(report.id, selectedUser, currentUser.id, note, currentOrganization.id);
      toast({ title: "Success", description: "Report assigned successfully." });
      onSuccess();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: "Failed to assign report.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Report</DialogTitle>
          <DialogDescription className="text-gray-400">
            Assign "{report?.title}" to a team member for resolution.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white">
                <SelectValue placeholder={loading ? "Loading users..." : "Select team member"} />
              </SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {users.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.user?.raw_user_meta_data?.full_name || u.user?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add instructions or context..."
              className="bg-[#252541] border-[#3a3a5a] text-white min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedUser || submitting}
            className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}