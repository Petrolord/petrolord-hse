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

  // Design family (batch 1B): priority is a status, so a Badge status variant
  // with the word inside it.
  const priorityVariants = {
    low: 'success', medium: 'warning', high: 'danger', critical: 'danger',
  };
  const sectionLabel = 'text-xs font-semibold text-pl-muted uppercase';
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-pl-border bg-pl-surface">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-3 pr-8">
            <Badge variant="neutral" className="font-pl-mono">
              {action.action_code}
            </Badge>
            <div className="flex gap-2">
               <Badge variant={priorityVariants[action.priority] || 'neutral'} className="capitalize">{action.priority}</Badge>
               <Badge variant="secondary" className="capitalize">{action.status.replace('_', ' ')}</Badge>
            </div>
          </div>
          
          <SheetTitle className="text-2xl font-semibold mt-2 text-pl-text leading-tight">{action.title}</SheetTitle>
          
          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full bg-pl-sunken/60 p-3 rounded-lg border border-pl-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-pl-muted">Priority</Label>
                    <Select value={editedPriority} onValueChange={setEditedPriority}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['low', 'medium', 'high', 'critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-pl-muted">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-3 w-3" aria-hidden="true" />
                          {editedDueDate ? format(editedDueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={editedDueDate} onSelect={setEditedDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-pl-muted">Assignee</Label>
                  <Select value={editedAssignee} onValueChange={setEditedAssignee}>
                    <SelectTrigger className="h-8">
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
                  <Button size="sm" onClick={handleSaveChanges}><Save className="h-3 w-3 mr-2" aria-hidden="true" /> Save</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-pl-muted">
                  <CalendarIcon className="h-4 w-4 text-pl-muted" aria-hidden="true" />
                  <span>Due: <span className="font-pl-mono tabular-nums text-pl-text">{new Date(action.due_date).toLocaleDateString()}</span></span>
                </div>
                <div className="flex items-center gap-2 text-pl-muted">
                  <User className="h-4 w-4 text-pl-muted" aria-hidden="true" />
                  <span>{action.assignee ? action.assignee.raw_user_meta_data?.full_name : 'Unassigned'}</span>
                </div>
                <Button variant="link" size="sm" onClick={() => setIsEditing(true)} className="ml-auto p-0 h-auto font-normal">
                  <Edit2 className="h-3 w-3 mr-1" aria-hidden="true" /> Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="workflow">Timeline</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="comments">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="text-pl-muted">Completion Progress</Label>
                  <span className="text-pl-text font-semibold font-pl-mono tabular-nums">{progress}%</span>
                </div>
                <Slider 
                  value={[progress]} 
                  onValueChange={handleProgressChange} 
                  max={100} step={5} 
                />
              </div>

              <div className="bg-pl-surface p-4 rounded-lg border border-pl-border">
                <h4 className={`${sectionLabel} mb-2`}>Description</h4>
                <p className="text-sm text-pl-text leading-relaxed whitespace-pre-wrap">{action.description}</p>
              </div>

              {action.report && (
                <div className="bg-pl-surface p-4 rounded-lg border border-pl-border flex justify-between items-center gap-2 cursor-pointer hover:bg-pl-sunken/60 transition-colors">
                  <div>
                    <h4 className={`${sectionLabel} mb-1`}>Source Report</h4>
                    <p className="text-sm text-pl-text font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-pl-muted" aria-hidden="true" />
                      {action.report.title} ({action.report.reference_code})
                    </p>
                  </div>
                  <Button variant="link" size="sm">View Report</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="mt-6">
               <ActionApprovalWorkflow action={action} />
            </TabsContent>

            <TabsContent value="docs" className="mt-6 space-y-4">
              <div className="bg-pl-surface p-4 rounded-lg border border-pl-border space-y-4">
                <h4 className={sectionLabel}>Attached Documents / Evidence</h4>
                {documents.length === 0 ? (
                  <p className="text-sm text-pl-muted italic">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-pl-sunken/60 p-2 rounded border border-pl-border">
                        <span className="text-sm text-pl-text truncate max-w-[200px]">{doc.url}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Download"><Download className="h-3 w-3" aria-hidden="true" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 border-t border-pl-border flex gap-2">
                  <Input 
                    placeholder="Paste file URL or link..." 
                    value={docUrl} 
                    onChange={e => setDocUrl(e.target.value)} 
                    className="text-xs h-8"
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddDocument} className="h-8">Add</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6 flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {comments.map((c, i) => (
                   <div key={i} className="flex gap-3">
                     <Avatar className="h-8 w-8 mt-1"><AvatarFallback className="text-xs">U</AvatarFallback></Avatar>
                     <div className="flex-1">
                       <div className="bg-pl-surface p-3 rounded-lg rounded-tl-none border border-pl-border"><p className="text-sm text-pl-text">{c.content}</p></div>
                       <span className="text-[11px] text-pl-muted mt-1 block">{new Date(c.created_at).toLocaleString()}</span>
                     </div>
                   </div>
                 ))}
                 {comments.length === 0 && <p className="text-center text-sm text-pl-muted py-6">No comments yet.</p>}
              </div>
               <div className="flex gap-2 items-end pt-4 mt-auto border-t border-pl-border">
                 <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Type a message..." className="resize-none min-h-[60px]" />
                 <Button size="icon" onClick={handleAddComment} className="h-10 w-10 shrink-0" aria-label="Send comment"><Send className="h-4 w-4" aria-hidden="true" /></Button>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 sm:p-6 pt-4 border-t border-pl-border bg-pl-surface flex flex-col sm:flex-row gap-2 sm:justify-between">
           <div className="flex gap-2 w-full sm:w-auto">
             {action.status === 'open' && <Button className="flex-1 sm:flex-none" onClick={() => handleStatusUpdate('in_progress')}>Start Progress</Button>}
             {action.status === 'in_progress' && <Button className="flex-1 sm:flex-none" onClick={() => handleStatusUpdate('pending_approval', { progress_percentage: 100 })}>Submit for Approval</Button>}
             {action.status === 'pending_approval' && (
               <>
                 <Button variant="outline" className="border-pl-danger/60 text-pl-danger-text hover:bg-pl-danger-bg" onClick={() => handleStatusUpdate('open')}>Reject</Button>
                 <Button onClick={() => handleStatusUpdate('closed')}>Approve & Close</Button>
               </>
             )}
             {action.status === 'closed' && <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleStatusUpdate('open')}>Reopen</Button>}
           </div>
           <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}