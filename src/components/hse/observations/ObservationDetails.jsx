import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, User, Activity, CheckCircle2, MessageSquare, Send, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { observationsService } from '@/services/observationsService';

export default function ObservationDetails({ observation, isOpen, onClose, onStatusChange }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(observation?.meta_data?.comments || []);

  // Update internal state when prop changes
  React.useEffect(() => {
    setComments(observation?.meta_data?.comments || []);
  }, [observation]);

  if (!observation) return null;

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      // Assuming 'current-user' would be real ID in full auth context
      const newComment = await observationsService.addComment(observation.id, 'current-user', comment);
      setComments([...comments, newComment]);
      setComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const statusColor = observation.status === 'open' ? 'bg-blue-500' : observation.status === 'closed' ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[600px] bg-[#1a1a2e] border-l border-[#3a3a5a] text-white overflow-y-auto p-0 flex flex-col h-full">
        <div className="p-6 pb-2 border-b border-[#3a3a5a] bg-[#252541]">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="font-mono bg-[#3a3a5a]/50 border-[#3a3a5a] text-[#b0b0c0]">
              {observation.reference_code}
            </Badge>
            <div className="flex gap-2">
               <Badge className={`capitalize ${statusColor} hover:${statusColor}`}>
                 {observation.status.replace('_', ' ')}
               </Badge>
            </div>
          </div>
          <SheetTitle className="text-2xl font-bold mt-2 text-white leading-tight">{observation.title}</SheetTitle>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#b0b0c0]">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(observation.incident_date).toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {observation.site?.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-[#252541] border border-[#3a3a5a]">
              <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-[#3a3a5a] data-[state=active]:text-white">Details</TabsTrigger>
              <TabsTrigger value="media" className="flex-1 data-[state=active]:bg-[#3a3a5a] data-[state=active]:text-white">Media</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 data-[state=active]:bg-[#3a3a5a] data-[state=active]:text-white">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="bg-[#252541]/30 p-4 rounded-lg border border-[#3a3a5a]">
                <h4 className="text-xs font-bold text-[#7a7a9a] uppercase mb-2">Description</h4>
                <p className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap">{observation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252541]/30 p-3 rounded-lg border border-[#3a3a5a]">
                  <span className="text-xs text-[#7a7a9a] block mb-1 uppercase">Severity</span>
                  <span className="font-medium capitalize flex items-center gap-2">
                    {observation.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {observation.severity}
                  </span>
                </div>
                <div className="bg-[#252541]/30 p-3 rounded-lg border border-[#3a3a5a]">
                  <span className="text-xs text-[#7a7a9a] block mb-1 uppercase">Category</span>
                  <span className="font-medium">{observation.hazard_category || 'General'}</span>
                </div>
              </div>

              {observation.immediate_controls && (
                <div className="bg-[#252541]/30 p-4 rounded-lg border border-[#3a3a5a]">
                  <h4 className="text-xs font-bold text-[#7a7a9a] uppercase mb-2">Immediate Controls</h4>
                  <p className="text-sm text-[#e0e0e0]">{observation.immediate_controls}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-[#e0e0e0] mb-3 flex items-center gap-2 border-b border-[#3a3a5a] pb-2">
                  <User className="h-4 w-4"/> People Involved
                </h4>
                {observation.people_involved?.length > 0 ? (
                  <div className="space-y-2">
                    {observation.people_involved.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-3 bg-[#252541]/50 rounded border border-[#3a3a5a]">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[#7a7a9a] text-xs px-2 py-0.5 bg-[#1a1a2e] rounded-full">{p.role}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[#7a7a9a] italic">No people listed.</p>}
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
               {observation.attachments?.length > 0 ? (
                 <div className="grid grid-cols-2 gap-3">
                   {observation.attachments.map((file, i) => (
                     <div key={i} className="aspect-video bg-[#252541] rounded border border-[#3a3a5a] flex flex-col items-center justify-center p-2 group hover:border-[#FFC107] transition-colors cursor-pointer">
                        {/* Placeholder for actual image/video rendering */}
                        <div className="bg-[#3a3a5a] w-full h-full rounded flex items-center justify-center mb-2">
                           <span className="text-xs text-[#7a7a9a]">Preview</span>
                        </div>
                        <span className="text-xs text-[#b0b0c0] truncate w-full text-center">{file.name}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 text-[#7a7a9a] bg-[#252541]/30 rounded border border-[#3a3a5a] border-dashed">
                   No photos or videos attached.
                 </div>
               )}
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-4">
               <div className="space-y-4 mb-6">
                 {comments.length === 0 && <p className="text-center text-[#7a7a9a] text-sm py-4">No comments yet.</p>}
                 {comments.map((c, i) => (
                   <div key={i} className="flex gap-3">
                     <Avatar className="h-8 w-8 mt-1">
                       <AvatarFallback className="bg-[#3a3a5a] text-xs">U</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="bg-[#252541] p-3 rounded-lg rounded-tl-none border border-[#3a3a5a]">
                         <p className="text-sm text-[#e0e0e0]">{c.content}</p>
                       </div>
                       <span className="text-[10px] text-[#7a7a9a] mt-1 block">{new Date(c.created_at).toLocaleString()}</span>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="flex gap-2 items-end pt-4 border-t border-[#3a3a5a]">
                 <Textarea 
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                   placeholder="Add a comment..."
                   className="bg-[#1a1a2e] border-[#3a3a5a] min-h-[80px] focus:ring-[#FFC107] resize-none"
                 />
                 <Button size="icon" onClick={handleAddComment} className="bg-[#FFC107] text-black hover:bg-[#FFD54F] h-10 w-10">
                   <Send className="h-4 w-4" />
                 </Button>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="p-6 pt-4 border-t border-[#3a3a5a] bg-[#1a1a2e] flex flex-col sm:flex-row gap-2 sm:justify-between">
           <div className="flex gap-2 w-full sm:w-auto">
             {observation.status !== 'closed' ? (
               <Button variant="destructive" className="flex-1 sm:flex-none" onClick={() => onStatusChange(observation.id, 'closed')}>
                 <CheckCircle2 className="mr-2 h-4 w-4" /> Close
               </Button>
             ) : (
               <Button variant="outline" className="flex-1 sm:flex-none border-[#3a3a5a] text-[#FFC107] hover:text-[#FFD54F]" onClick={() => onStatusChange(observation.id, 'open')}>
                 <ArrowUpRight className="mr-2 h-4 w-4" /> Reopen
               </Button>
             )}
           </div>
           <Button variant="secondary" className="w-full sm:w-auto bg-[#3a3a5a] text-white hover:bg-[#4a4a6a]" onClick={onClose}>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}