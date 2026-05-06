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
        className: "bg-[#22C55E] text-white border-none"
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
      <DialogContent className="sm:max-w-[850px] bg-[#1a1a2e] border-[#3a3a5a] text-white max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 border-b border-[#3a3a5a] bg-[#1f1f35]">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            Create Custom Safety Moment
            <Badge variant="outline" className="border-[#FFC107] text-[#FFC107] text-xs py-0">Draft</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 bg-[#1a1a2e]">
            <TabsList className="bg-[#252541] w-full justify-start p-1 border border-[#3a3a5a]">
              <TabsTrigger value="basics" className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white text-[#b0b0c0]">Basics</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white text-[#b0b0c0]">Key Content</TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white text-[#b0b0c0]">Scenario & Engagement</TabsTrigger>
              <TabsTrigger value="review" className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white text-[#b0b0c0]">Summary & Review</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <form id="create-moment-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
              
              <TabsContent value="basics" className="space-y-5 m-0 focus-visible:ring-0">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#b0b0c0]">Topic Title *</Label>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                      placeholder="e.g. Ladder Safety Fundamentals"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#b0b0c0]">Category</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                      <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white focus:ring-[#FFC107]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#b0b0c0]">Estimated Duration (min)</Label>
                    <Input 
                      type="number" 
                      value={formData.duration} 
                      onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} 
                      className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#b0b0c0]">When to use this talk?</Label>
                    <Input 
                      value={formData.when_to_use} 
                      onChange={e => setFormData({...formData, when_to_use: e.target.value})} 
                      className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]"
                      placeholder="e.g. Before working at heights" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-[#b0b0c0]">Why It Matters (Introduction)</Label>
                    <Button type="button" variant="ghost" size="xs" className="h-5 text-xs text-[#FFC107] hover:text-[#FFD54F]"><Sparkles className="h-3 w-3 mr-1" /> AI Assist</Button>
                  </div>
                  <Textarea 
                    value={formData.why_it_matters} 
                    onChange={e => setFormData({...formData, why_it_matters: e.target.value})} 
                    className="bg-[#252541] border-[#3a3a5a] text-white h-32 focus-visible:ring-[#FFC107]" 
                    placeholder="Explain why this safety topic is critical..." 
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 m-0 focus-visible:ring-0">
                {/* Key Talking Points */}
                <div className="space-y-3">
                  <Label className="text-[#b0b0c0] block">Key Talking Points (3-5 recommended)</Label>
                  {formData.key_talking_points.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="mt-2.5 text-[#22C55E] text-xs font-mono">{idx + 1}.</span>
                      <Input 
                        value={point} 
                        onChange={(e) => updateList('key_talking_points', idx, e.target.value)}
                        className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                        placeholder="Key safety point..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('key_talking_points', idx)} className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('key_talking_points')} className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white bg-transparent">
                    <Plus className="h-3 w-3 mr-2" /> Add Point
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Do List */}
                  <div className="space-y-3">
                    <Label className="text-[#22C55E] block font-bold">DO List</Label>
                    {formData.do_list.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={item} 
                          onChange={(e) => updateList('do_list', idx, e.target.value)}
                          className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#22C55E]" 
                          placeholder="Do..."
                        />
                        {idx > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('do_list', idx)} className="text-red-400 h-10 w-10"><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('do_list')} className="text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10 px-0">
                      <Plus className="h-3 w-3 mr-1" /> Add Do
                    </Button>
                  </div>

                  {/* Don't List */}
                  <div className="space-y-3">
                    <Label className="text-red-400 block font-bold">DON'T List</Label>
                    {formData.dont_list.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={item} 
                          onChange={(e) => updateList('dont_list', idx, e.target.value)}
                          className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-red-400" 
                          placeholder="Don't..."
                        />
                        {idx > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('dont_list', idx)} className="text-red-400 h-10 w-10"><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('dont_list')} className="text-red-400 hover:text-red-400 hover:bg-red-400/10 px-0">
                      <Plus className="h-3 w-3 mr-1" /> Add Don't
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6 m-0 focus-visible:ring-0">
                <div className="bg-[#252541]/50 p-4 rounded-lg border border-[#3a3a5a]">
                  <Label className="text-[#b0b0c0] block mb-3 font-semibold">Incident Scenario</Label>
                  <div className="space-y-3">
                    <Textarea 
                      value={formData.incident_scenario.what_happened} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, what_happened: e.target.value}})}
                      className="bg-[#1a1a2e] border-[#3a3a5a] text-white h-20 text-sm" 
                      placeholder="What happened? (Story)" 
                    />
                    <Textarea 
                      value={formData.incident_scenario.what_should_happen} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, what_should_happen: e.target.value}})}
                      className="bg-[#1a1a2e] border-[#3a3a5a] text-white h-20 text-sm" 
                      placeholder="What SHOULD have happened? (The correct procedure)" 
                    />
                    <Textarea 
                      value={formData.incident_scenario.lesson} 
                      onChange={e => setFormData({...formData, incident_scenario: {...formData.incident_scenario, lesson: e.target.value}})}
                      className="bg-[#1a1a2e] border-[#3a3a5a] text-white h-16 text-sm" 
                      placeholder="What is the lesson learned?" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[#b0b0c0] block">Discussion Questions</Label>
                  {formData.discussion_questions.map((q, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="mt-2.5 text-[#FFC107] text-xs font-bold">Q{idx + 1}</span>
                      <Input 
                        value={q} 
                        onChange={(e) => updateList('discussion_questions', idx, e.target.value)}
                        className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                        placeholder="Question for the team..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('discussion_questions', idx)} className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('discussion_questions')} className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white bg-transparent">
                    <Plus className="h-3 w-3 mr-2" /> Add Question
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-5 m-0 focus-visible:ring-0">
                <div className="space-y-2">
                  <Label className="text-[#b0b0c0]">One Minute Recap (Summary)</Label>
                  <Textarea 
                    value={formData.one_minute_recap} 
                    onChange={e => setFormData({...formData, one_minute_recap: e.target.value})} 
                    className="bg-[#252541] border-[#3a3a5a] text-white h-24 focus-visible:ring-[#FFC107]" 
                    placeholder="Short summary for quick review..." 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[#b0b0c0] block">Site Checklist Items</Label>
                  {formData.site_checklist.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={item} 
                        onChange={(e) => updateList('site_checklist', idx, e.target.value)}
                        className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                        placeholder="Checklist item..."
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('site_checklist', idx)} className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('site_checklist')} className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white bg-transparent">
                    <Plus className="h-3 w-3 mr-2" /> Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-[#b0b0c0] block">References / Standards</Label>
                  {formData.references.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={item} 
                        onChange={(e) => updateList('references', idx, e.target.value)}
                        className="bg-[#252541] border-[#3a3a5a] text-white focus-visible:ring-[#FFC107]" 
                        placeholder="e.g. OSHA 1910.147"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('references', idx)} className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addListItem('references')} className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white bg-transparent">
                    <Plus className="h-3 w-3 mr-2" /> Add Reference
                  </Button>
                </div>
              </TabsContent>

            </form>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-6 border-t border-[#3a3a5a] bg-[#1f1f35]">
          <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0] hover:text-white hover:bg-[#252541]">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#22C55E] hover:bg-[#16a34a] text-white shadow-lg shadow-[#22C55E]/20">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save to Bank
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}