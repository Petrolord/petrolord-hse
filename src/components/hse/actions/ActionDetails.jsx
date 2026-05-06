import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, User, Send, FileText, Download, CheckSquare, Edit2, Save } from 'lucide-react';
import { actionsService } from '@/services/actionsService';
import { useHSE } from '@/context/HSEContext';
import ActionApprovalWorkflow from './ActionApprovalWorkflow';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ActionDetails({ action, isOpen, onClose, onRefresh, users = [] }) {
  const { currentUser } = useHSE();
  const { toast } = useToast();
  
  // Local state for editing fields
  const [isEditing, setIsEditing] = useState(false);
  const [editedPriority, setEditedPriority] = useState("");
  const [editedAssignee, setEditedAssignee] = useState("");
  const [editedDueDate, setEditedDueDate] = useState(null);
  
  // Progress & Comments state
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  
  // Completion Documents state
  const [docUrl, setDocUrl] = useState("");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (action) {
      setComments(action?.meta_data?.comments || []);
      setProgress(action.progress_percentage || 0);
      setEditedPriority(action.priority);
      setEditedAssignee(action.assigned_to);
      setEditedDueDate(action.due_date ? new Date(action.due_date) : null);
      setDocuments(action.completion_documents || []);
    }
  }, [action]);

  if (!action) return null;

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const newComment = await actionsService.addComment(action.id, currentUser.id, comment);
      setComments([...comments, newComment]);
      setComment("");
      toast({ title: "Comment Added" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    }
  };

  const handleAddDocument = async () => {
    if (!docUrl.trim()) return;
    const newDoc = { url: docUrl, added_at: new Date().toISOString(), added_by: currentUser.id };
    const updatedDocs = [...documents, newDoc];
    
    try {
      await actionsService.updateAction(action.id, { completion_documents: updatedDocs });
      setDocuments(updatedDocs);
      setDocUrl("");
      toast({ title: "Document Link Added" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add document.", variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (status, extraData = {}) => {
     try {
        await actionsService.updateAction(action.id, { status, ...extraData });
        toast({ title: "Status Updated", description: `Action moved to ${status.replace('_', ' ')}`});
        onRefresh(); 
        onClose(); 
     } catch (e) {
        toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
     }
  }

  const handleSaveChanges = async () => {
    try {
      await actionsService.updateAction(action.id, {
        priority: editedPriority,
        assigned_to: editedAssignee,
        due_date: editedDueDate?.toISOString()
      });
      toast({ title: "Changes Saved" });
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    }
  };

  const handleProgressChange = async (val) => {
    const newProgress = val[0];
    setProgress(newProgress);
    // Debounce this in a real app, but for now update on commit
    try {
        await actionsService.updateAction(action.id, { progress_percentage: newProgress });
    } catch(e) { console.error(e); }
  };

  const priorityColors = {
    low: 'bg-green-500/20 text-green-400', high: 'bg-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/20 text-yellow-400', critical: 'bg-red-500/20 text-red-400',
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[600px] bg-[#1a1a2e] border-l border-[#3a3a5a] text-white overflow-y-auto p-0 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#3a3a5a] bg-[#252541]">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono bg-[#3a3a5a]/50 border-[#3a3a5a] text-[#b0b0c0]">
              {action.action_code}
            </Badge>
            <div className="flex gap-2">
               <Badge className={`capitalize ${priorityColors[action.priority]}`}>{action.priority}</Badge>
               <Badge variant="secondary" className="capitalize bg-[#1a1a2e] text-white border border-[#3a3a5a]">{action.status.replace('_', ' ')}</Badge>
            </div>
          </div>
          
          <SheetTitle className="text-2xl font-bold mt-2 text-white leading-tight">{action.title}</SheetTitle>
          
          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full bg-[#1a1a2e] p-3 rounded-lg border border-[#3a3a5a]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-[#7a7a9a]">Priority</Label>
                    <Select value={editedPriority} onValueChange={setEditedPriority}>
                      <SelectTrigger className="h-8 bg-[#252541] border-[#3a3a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['low', 'medium', 'high', 'critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#7a7a9a]">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 w-full justify-start text-left font-normal bg-[#252541] border-[#3a3a5a]">
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {editedDueDate ? format(editedDueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1a1a2e] border-[#3a3a5a]">
                        <Calendar mode="single" selected={editedDueDate} onSelect={setEditedDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-[#7a7a9a]">Assignee</Label>
                  <Select value={editedAssignee} onValueChange={setEditedAssignee}>
                    <SelectTrigger className="h-8 bg-[#252541] border-[#3a3a5a]">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.raw_user_meta_data?.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" className="bg-[#FFC107] text-black" onClick={handleSaveChanges}><Save className="h-3 w-3 mr-2" /> Save</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#b0b0c0]">
                  <CalendarIcon className="h-4 w-4 text-[#FFC107]" />
                  <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[#b0b0c0]">
                  <User className="h-4 w-4 text-[#FFC107]" />
                  <span>{action.assignee ? action.assignee.raw_user_meta_data?.full_name : 'Unassigned'}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="ml-auto text-[#FFC107] hover:text-white p-0 h-auto font-normal">
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-[#252541] border border-[#3a3a5a] grid grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="workflow">Timeline</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="comments">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="text-[#b0b0c0]">Completion Progress</Label>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                <Slider 
                  value={[progress]} 
                  onValueChange={handleProgressChange} 
                  max={100} step={5} 
                  className="[&>.relative>.absolute]:bg-[#FFC107]"
                />
              </div>

              <div className="bg-[#252541]/30 p-4 rounded-lg border border-[#3a3a5a]">
                <h4 className="text-xs font-bold text-[#7a7a9a] uppercase mb-2">Description</h4>
                <p className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap">{action.description}</p>
              </div>

              {action.report && (
                <div className="bg-[#252541]/30 p-4 rounded-lg border border-[#3a3a5a] flex justify-between items-center cursor-pointer hover:bg-[#252541]/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-[#7a7a9a] uppercase mb-1">Source Report</h4>
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      {action.report.title} ({action.report.reference_code})
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#FFC107]">View Report</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="mt-6">
               <ActionApprovalWorkflow action={action} />
            </TabsContent>

            <TabsContent value="docs" className="mt-6 space-y-4">
              <div className="bg-[#252541]/30 p-4 rounded-lg border border-[#3a3a5a] space-y-4">
                <h4 className="text-xs font-bold text-[#7a7a9a] uppercase">Attached Documents / Evidence</h4>
                {documents.length === 0 ? (
                  <p className="text-sm text-[#7a7a9a] italic">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-[#1a1a2e] p-2 rounded border border-[#3a3a5a]">
                        <span className="text-sm text-white truncate max-w-[200px]">{doc.url}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3 w-3" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 border-t border-[#3a3a5a] flex gap-2">
                  <Input 
                    placeholder="Paste file URL or link..." 
                    value={docUrl} 
                    onChange={e => setDocUrl(e.target.value)} 
                    className="bg-[#1a1a2e] border-[#3a3a5a] text-xs h-8"
                  />
                  <Button size="sm" onClick={handleAddDocument} className="h-8 bg-[#3a3a5a]">Add</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6 flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {comments.map((c, i) => (
                   <div key={i} className="flex gap-3">
                     <Avatar className="h-8 w-8 mt-1"><AvatarFallback className="bg-[#3a3a5a] text-xs">U</AvatarFallback></Avatar>
                     <div className="flex-1">
                       <div className="bg-[#252541] p-3 rounded-lg rounded-tl-none border border-[#3a3a5a]"><p className="text-sm text-[#e0e0e0]">{c.content}</p></div>
                       <span className="text-[10px] text-[#7a7a9a] mt-1 block">{new Date(c.created_at).toLocaleString()}</span>
                     </div>
                   </div>
                 ))}
                 {comments.length === 0 && <p className="text-center text-sm text-[#7a7a9a] py-6">No comments yet.</p>}
              </div>
               <div className="flex gap-2 items-end pt-4 mt-auto border-t border-[#3a3a5a]">
                 <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Type a message..." className="bg-[#1a1a2e] border-[#3a3a5a] resize-none min-h-[60px]" />
                 <Button size="icon" onClick={handleAddComment} className="bg-[#FFC107] text-black h-10 w-10"><Send className="h-4 w-4" /></Button>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-6 pt-4 border-t border-[#3a3a5a] bg-[#1a1a2e] flex flex-col sm:flex-row gap-2 sm:justify-between">
           <div className="flex gap-2 w-full sm:w-auto">
             {action.status === 'open' && <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate('in_progress')}>Start Progress</Button>}
             {action.status === 'in_progress' && <Button className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700" onClick={() => handleStatusUpdate('pending_approval', { progress_percentage: 100 })}>Submit for Approval</Button>}
             {action.status === 'pending_approval' && (
               <>
                 <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20" onClick={() => handleStatusUpdate('open')}>Reject</Button>
                 <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('closed')}>Approve & Close</Button>
               </>
             )}
             {action.status === 'closed' && <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleStatusUpdate('open')}>Reopen</Button>}
           </div>
           <Button variant="secondary" className="w-full sm:w-auto bg-[#3a3a5a] text-white" onClick={onClose}>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}