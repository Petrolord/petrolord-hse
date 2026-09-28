import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { safetyMomentService } from '@/services/safetyMomentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function NewSafetyMomentModal({ isOpen, onClose, onSuccess, categories }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  
  const [formData, setFormData] = useState({
    title: '', 
    category_id: '', 
    duration: 5, 
    when_to_use: '',
    why_it_matters: '',
    key_talking_points: [''],
    do_list: [''],
    dont_list: [''],
    incident_scenario: { what_happened: '', what_should_happen: '', lesson: '' },
    discussion_questions: [''],
    site_checklist: [''],
    one_minute_recap: '',
    references: ['']
  });

  const updateList = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const addListItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeListItem = (field, index) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrganization) {
        toast({ title: "Error", description: "No organization selected.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      // Clean up empty strings from lists
      const cleanData = {
        ...formData,
        key_talking_points: formData.key_talking_points.filter(i => i.trim()),
        do_list: formData.do_list.filter(i => i.trim()),
        dont_list: formData.dont_list.filter(i => i.trim()),
        discussion_questions: formData.discussion_questions.filter(i => i.trim()),
        site_checklist: formData.site_checklist.filter(i => i.trim()),
        references: formData.references.filter(i => i.trim()),
        // Map legacy fields for backward compatibility
        description: formData.one_minute_recap,
        key_points: formData.key_talking_points.filter(i => i.trim()),
      };

      await safetyMomentService.createUserMoment({
        org_id: currentOrganization.id,
        user_id: currentUser.id,
        ...cleanData,
        created_by: currentUser.id,
        status: 'Draft',
      });
      
      toast({ 
        title: "Success", 
        description: "Safety moment created successfully.",
        variant: "success"
      });
      if(onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create safety moment.", variant: "destructive" });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="p-4 sm:p-6 pr-12 sm:pr-12 border-b border-pl-border bg-pl-surface text-left">
          <DialogTitle className="text-xl font-semibold text-pl-text flex flex-wrap items-center gap-2">
            Create Custom Safety Moment
            <Badge variant="neutral" className="text-xs py-0">Draft</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 pt-4">
            <TabsList className="w-full h-auto flex-wrap justify-start">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="content">Key Content</TabsTrigger>
              <TabsTrigger value="engagement">Scenario & Engagement</TabsTrigger>
              <TabsTrigger value="review">Summary & Review</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4 sm:p-6">
            <form id="create-moment-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
              
              <TabsContent value="basics" className="space-y-5 m-0 focus-visible:ring-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Topic Title *</Label>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="e.g. Ladder Safety Fundamentals"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Estimated Duration (min)</Label>
                    <Input 
                      type="number" 
                      value={formData.duration} 
                      onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>When to use this talk?</Label>
                    <Input 
                      value={formData.when_to_use} 
                      onChange={e => setFormData({...formData, when_to_use: e.target.value})} 
                      placeholder="e.g. Before working at heights" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Why It Matters (Introduction)</Label>
                    <Button type="button" variant="ghost" size="xs" className="h-5 text-xs text-pl-primary-text"><Sparkles className="h-3 w-3 mr-1" aria-hidden="true" /> AI Assist</Button>
                  </div>
                  <Textarea 
                    value={formData.why_it_matters} 
                    onChange={e => setFormData({...formData, why_it_matters: e.target.value})} 
                    className="h-32" 
                    placeholder="Explain why this safety topic is critical..." 
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 m-0 focus-visible:ring-0">
                {/* Key Talking Points */}
                <div className="space-y-3">
                  <Label className="block">Key Talking Points (3-5 recommended)</Label>
                  {formData.key_talking_points.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="mt-2.5 text-pl-muted text-xs font-pl-mono tabular-nums">{idx + 1}.</span>
                      <Input 
                        value={point} 
                        onChange={(e) => updateList('key_talking_points', idx, e.target.value)}
                        placeholder="Key safety point..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('key_talking_points', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text" aria-label="Remove">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('key_talking_points')}>
                    <Plus className="h-3 w-3 mr-2" aria-hidden="true" /> Add Point
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Do List */}
                  <div className="space-y-3">
                    <Label className="text-pl-success-text block font-bold">DO List</Label>
                    {formData.do_list.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={item} 
                          onChange={(e) => updateList('do_list', idx, e.target.value)}
                          placeholder="Do..."
                        />
                        {idx > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('do_list', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text h-10 w-10 shrink-0" aria-label="Remove"><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('do_list')} className="text-pl-success-text hover:text-pl-success-text hover:bg-pl-success-bg px-2">
                      <Plus className="h-3 w-3 mr-1" aria-hidden="true" /> Add Do
                    </Button>
                  </div>

                  {/* Don't List */}
                  <div className="space-y-3">
                    <Label className="text-pl-danger-text block font-bold">DON'T List</Label>
                    {formData.dont_list.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={item} 
                          onChange={(e) => updateList('dont_list', idx, e.target.value)}
                          placeholder="Don't..."
                        />
                        {idx > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('dont_list', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text h-10 w-10 shrink-0" aria-label="Remove"><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('dont_list')} className="text-pl-danger-text hover:text-pl-danger-text hover:bg-pl-danger-bg px-2">
                      <Plus className="h-3 w-3 mr-1" aria-hidden="true" /> Add Don't
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6 m-0 focus-visible:ring-0">
                <div className="bg-pl-sunken p-4 rounded-lg border border-pl-border">
                  <Label className="block mb-3 font-semibold">Incident Scenario</Label>
                  <div className="space-y-3">
                    <Textarea 
                      value={formData.incident_scenario.what_happened} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, what_happened: e.target.value}})}
                      className="h-20 text-sm" 
                      placeholder="What happened? (Story)" 
                    />
                    <Textarea 
                      value={formData.incident_scenario.what_should_happen} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, what_should_happen: e.target.value}})}
                      className="h-20 text-sm" 
                      placeholder="What SHOULD have happened? (The correct procedure)" 
                    />
                    <Textarea 
                      value={formData.incident_scenario.lesson} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, lesson: e.target.value}})}
                      className="h-16 text-sm" 
                      placeholder="What is the lesson learned?" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="block">Discussion Questions</Label>
                  {formData.discussion_questions.map((q, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="mt-2.5 text-pl-muted text-xs font-bold font-pl-mono tabular-nums">Q{idx + 1}</span>
                      <Input 
                        value={q} 
                        onChange={(e) => updateList('discussion_questions', idx, e.target.value)}
                        placeholder="Question for the team..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('discussion_questions', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text" aria-label="Remove">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('discussion_questions')}>
                    <Plus className="h-3 w-3 mr-2" aria-hidden="true" /> Add Question
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-5 m-0 focus-visible:ring-0">
                <div className="space-y-2">
                  <Label>One Minute Recap (Summary)</Label>
                  <Textarea 
                    value={formData.one_minute_recap} 
                    onChange={e => setFormData({...formData, one_minute_recap: e.target.value})} 
                    className="h-24" 
                    placeholder="Short summary for quick review..." 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="block">Site Checklist Items</Label>
                  {formData.site_checklist.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={item} 
                        onChange={(e) => updateList('site_checklist', idx, e.target.value)}
                        placeholder="Checklist item..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('site_checklist', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text" aria-label="Remove">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('site_checklist')}>
                    <Plus className="h-3 w-3 mr-2" aria-hidden="true" /> Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="block">References / Standards</Label>
                  {formData.references.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={item} 
                        onChange={(e) => updateList('references', idx, e.target.value)}
                        placeholder="e.g. OSHA 1910.147"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('references', idx)} className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text" aria-label="Remove">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('references')}>
                    <Plus className="h-3 w-3 mr-2" aria-hidden="true" /> Add Reference
                  </Button>
                </div>
              </TabsContent>

            </form>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-4 sm:p-6 border-t border-pl-border bg-pl-surface gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save to Bank
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}