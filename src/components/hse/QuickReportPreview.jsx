import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Printer, 
  Download, 
  Share2, 
  Edit2, 
  Bot, 
  MapPin, 
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Camera,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { PETROLORD_BRANDING } from '@/components/branding/BrandingGuide';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { motion, AnimatePresence } from 'framer-motion';

const HAZARD_CATEGORIES = [
  { id: 'Slip/Trip/Fall', label: 'Slip, Trip, Fall', desc: 'Uneven surfaces, wet floors, obstacles, height hazards' },
  { id: 'Fire/Explosion', label: 'Fire & Explosion', desc: 'Flammables, hot work, sparks, smoke, heat' },
  { id: 'Chemical/Biological', label: 'Chemical Exposure', desc: 'Toxic fumes, spills, contact with hazardous substances' },
  { id: 'Electrical', label: 'Electrical Hazard', desc: 'Exposed wires, faulty equipment, static, shock risk' },
  { id: 'Ergonomic', label: 'Ergonomic', desc: 'Lifting, posture, repetitive motion, workspace design' },
  { id: 'Behavioral', label: 'Behavioral/Violence', desc: 'Unsafe acts, harassment, negligence, aggression' },
  { id: 'Environmental', label: 'Environmental', desc: 'Spills, emissions, waste, ecological impact' },
  { id: 'Security', label: 'Security', desc: 'Breach, theft, unauthorized access, suspicious activity' },
  { id: 'Health', label: 'Health', desc: 'Illness, fatigue, noise, radiation, thermal stress' },
  { id: 'BIAV', label: 'BIAV', desc: 'Biological, Infectious, Animal, Vector hazards' },
  { id: 'Community', label: 'Community Impact', desc: 'Noise, dust, traffic, reputation, local disturbance' },
  { id: 'Other', label: 'Other', desc: 'Hazards not covered by other categories' }
];

const RISK_LEVELS = [
  { id: 'Immediate Danger', label: 'Immediate Danger', desc: 'Life-threatening, requires immediate action' },
  { id: 'High Risk', label: 'High Risk', desc: 'Serious injury possible, urgent action needed' },
  { id: 'Medium Risk', label: 'Medium Risk', desc: 'Moderate injury possible, action needed' },
  { id: 'Low Risk', label: 'Low Risk', desc: 'Minor injury possible, preventive action' }
];

export default function QuickReportPreview({ reportData, onEdit, onSubmit, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(reportData);
  const { getDepartments, getSites } = useOrganizationData();
  
  const [departments, setDepartments] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  
  // Advanced Details State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [injuredName, setInjuredName] = useState("");
  const [advancedMedia, setAdvancedMedia] = useState([]);

  useEffect(() => {
    const loadOrgData = async () => {
      const depts = await getDepartments();
      const orgSites = await getSites();
      setDepartments(depts || []);
      setSites(orgSites || []);
    };
    loadOrgData();
    
    // Initialize advanced data structure if not present
    if (!editedData.witnesses) setEditedData(prev => ({...prev, witnesses: []}));
    if (!editedData.injured_persons) setEditedData(prev => ({...prev, injured_persons: []}));
    if (!editedData.media_urls) setEditedData(prev => ({...prev, media_urls: []}));
  }, []);
  
  // Submission Options State
  const [options, setOptions] = useState({
    isAnonymous: false,
    sendToSupervisor: true,
    submitToManagement: false,
    saveAsDraft: false
  });

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const addWitness = () => {
    if (witnessName.trim()) {
      setEditedData(prev => ({
        ...prev,
        witnesses: [...(prev.witnesses || []), { name: witnessName }]
      }));
      setWitnessName("");
    }
  };

  const addInjured = () => {
    if (injuredName.trim()) {
      setEditedData(prev => ({
        ...prev,
        injured_persons: [...(prev.injured_persons || []), { name: injuredName }]
      }));
      setInjuredName("");
    }
  };

  const handleAdvancedMediaUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdvancedMedia(prev => [...prev, ...filesArray]);
    }
  };

  const countFilledAdvanced = () => {
    let count = 0;
    if (editedData.category) count++;
    if (editedData.hazard_classification) count++;
    if (editedData.immediate_actions) count++;
    if (editedData.corrective_actions) count++;
    if (editedData.additional_notes) count++;
    if (editedData.witnesses?.length > 0) count++;
    if (editedData.injured_persons?.length > 0) count++;
    if (advancedMedia.length > 0) count++;
    return count;
  };

  const filledCount = countFilledAdvanced();

  const RenderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <img src={PETROLORD_BRANDING.logoUrl} alt="Petrolord" className="h-12 w-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-none">Safety Observation</h2>
            <p className="text-sm text-slate-500 mt-1">Generated via Quick Report AI</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono text-slate-600 mb-1">
            {editedData.reportId}
          </div>
          <div className="text-xs text-slate-500">
            {format(new Date(editedData.timestamp), 'PPpp')}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <User className="h-3 w-3" /> Submitted By
          </div>
          <p className="text-sm font-medium text-slate-900">
            {options.isAnonymous ? 'Anonymous User' : 'Current User'}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <MapPin className="h-3 w-3" /> Location
          </div>
          <p className="text-sm font-medium text-slate-900 truncate">
            {editedData.location}
          </p>
        </div>
      </div>

      {/* Main Observation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Observation Summary</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(editedData.severity)}`}>
            {editedData.severity?.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Description</span>
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Bot className="h-3 w-3" /> AI Generated
              </span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {editedData.description}
            </p>
          </div>
        </div>
        
        {/* Dropdowns for Org Data */}
        <div className="grid grid-cols-2 gap-4 pt-2">
           <div className="space-y-1">
              <Label className="text-xs text-slate-500">Assign Department</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent>
                  {departments.length > 0 ? (
                    departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                  ) : (
                    <SelectItem value="none" disabled>No departments configured</SelectItem>
                  )}
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-1">
              <Label className="text-xs text-slate-500">Assign Site</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="Select Site" /></SelectTrigger>
                <SelectContent>
                  {sites.length > 0 ? (
                    sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                  ) : (
                    <SelectItem value="none" disabled>No sites configured</SelectItem>
                  )}
                </SelectContent>
              </Select>
           </div>
        </div>
      </div>

      {/* Advanced Details Section - Expandable */}
      <div className="border rounded-lg bg-slate-50 overflow-hidden">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Advanced Details (Optional)</span>
            {filledCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                {filledCount} fields filled
              </span>
            )}
          </div>
          {showAdvanced ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        
        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 border-t border-slate-200">
                {/* Category & Hazard Classification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Category</Label>
                    <Select onValueChange={(val) => setEditedData(prev => ({...prev, category: val}))} value={editedData.category}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-auto py-2">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {HAZARD_CATEGORIES.map(c => (
                          <SelectItem key={c.id} value={c.id} textValue={c.label}>
                            <div className="flex flex-col text-left py-1">
                              <span className="font-semibold text-slate-900">{c.label}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{c.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Hazard Classification</Label>
                    <Select onValueChange={(val) => setEditedData(prev => ({...prev, hazard_classification: val}))} value={editedData.hazard_classification}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-auto py-2">
                        <SelectValue placeholder="Select Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_LEVELS.map(r => (
                          <SelectItem key={r.id} value={r.id} textValue={r.label}>
                            <div className="flex flex-col text-left py-1">
                              <span className="font-semibold text-slate-900">{r.label}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{r.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Immediate & Corrective Actions */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Immediate Actions Taken</Label>
                  <Input 
                    className="bg-white border-slate-300 text-slate-900"
                    placeholder="e.g. Stopped work, barricaded area..."
                    value={editedData.immediate_actions || ''}
                    onChange={(e) => setEditedData(prev => ({...prev, immediate_actions: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Suggested Corrective Actions</Label>
                  <Input 
                    className="bg-white border-slate-300 text-slate-900"
                    placeholder="e.g. Repair guardrail, conduct training..."
                    value={editedData.corrective_actions || ''}
                    onChange={(e) => setEditedData(prev => ({...prev, corrective_actions: e.target.value}))}
                  />
                </div>

                {/* People Involved */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 mb-1 block">People Involved</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">Witnesses</span>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          placeholder="Name" 
                          className="h-8 text-xs" 
                          value={witnessName}
                          onChange={(e) => setWitnessName(e.target.value)}
                        />
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={addWitness}><Plus className="h-3 w-3"/></Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {editedData.witnesses?.map((w, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                            {w.name} <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setEditedData(prev => ({...prev, witnesses: prev.witnesses.filter((_, idx) => idx !== i)}))} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">Injured Persons</span>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          placeholder="Name" 
                          className="h-8 text-xs" 
                          value={injuredName}
                          onChange={(e) => setInjuredName(e.target.value)}
                        />
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={addInjured}><Plus className="h-3 w-3"/></Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {editedData.injured_persons?.map((p, i) => (
                          <span key={i} className="text-[10px] bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 border border-red-100 text-red-700">
                            {p.name} <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setEditedData(prev => ({...prev, injured_persons: prev.injured_persons.filter((_, idx) => idx !== i)}))} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Media Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Additional Media (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2">
                      <Camera className="h-3 w-3" /> Add Photos/Videos
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleAdvancedMediaUpload} />
                    </label>
                    <span className="text-xs text-slate-400">
                      {advancedMedia.length} files selected
                    </span>
                  </div>
                  {advancedMedia.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {advancedMedia.map((file, idx) => (
                        <div key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                          {file.name.substring(0, 15)}...
                          <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setAdvancedMedia(prev => prev.filter((_, i) => i !== idx))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Additional Notes</Label>
                  <Textarea 
                    className="bg-white border-slate-300 text-slate-900 h-20 text-xs"
                    placeholder="Any other details..."
                    value={editedData.additional_notes || ''}
                    onChange={(e) => setEditedData(prev => ({...prev, additional_notes: e.target.value}))}
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Evidence Section (Original) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editedData.photo && (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <div className="p-2 border-b border-slate-200 bg-white">
              <p className="text-xs font-bold text-slate-500">Original Capture</p>
            </div>
            <div className="aspect-video relative bg-black">
              <img 
                src={URL.createObjectURL(editedData.photo)} 
                alt="Evidence" 
                className="absolute inset-0 w-full h-full object-contain" 
              />
            </div>
          </div>
        )}
        
        {editedData.transcription && (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white h-full">
            <div className="p-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500">Voice Note Transcription</p>
              <Bot className="h-3 w-3 text-blue-500" />
            </div>
            <div className="p-3">
              <p className="text-xs text-slate-600 italic">"{editedData.transcription}"</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Metadata */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs">
        <Bot className="h-4 w-4" />
        <span className="font-semibold">AI Analysis Confidence: {editedData.confidence}%</span>
        <span className="mx-2 text-blue-300">|</span>
        <span>Categorized as: <strong>{editedData.category || 'Pending'}</strong></span>
      </div>
    </div>
  );

  const EditForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700">Category</Label>
        <Select 
          defaultValue={editedData.category} 
          onValueChange={(val) => setEditedData({...editedData, category: val})}
        >
          <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Slip/Trip Hazard', 'PPE Violation', 'Unsafe Behavior', 'Fire Hazard', 'Spill', 'Other'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Severity</Label>
        <Select 
          defaultValue={editedData.severity}
          onValueChange={(val) => setEditedData({...editedData, severity: val})}
        >
          <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Low', 'Medium', 'High', 'Critical'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Description</Label>
        <Textarea 
          value={editedData.description} 
          onChange={(e) => setEditedData({...editedData, description: e.target.value})}
          className="min-h-[100px] bg-white border-slate-300 text-slate-900"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Location</Label>
        <Input 
          value={editedData.location}
          onChange={(e) => setEditedData({...editedData, location: e.target.value})}
          className="bg-white border-slate-300 text-slate-900"
        />
      </div>

      <div className="pt-4 flex gap-2">
        <Button onClick={handleSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
        <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancel</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Scrollable Content Area */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-8">
            {isEditing ? <EditForm /> : <RenderContent />}
          </div>
        </div>

        {/* Footer / Actions */}
        {!isEditing && (
          <div className="bg-slate-50 border-t border-slate-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Download className="h-4 w-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </div>

              {/* Right: Submission Options */}
              <div className="space-y-4 border-l border-slate-200 pl-0 lg:pl-8">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Submission Options</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anon" checked={options.isAnonymous} onCheckedChange={(c) => setOptions({...options, isAnonymous: c})} />
                    <label htmlFor="anon" className="text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Submit Anonymously
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sup" checked={options.sendToSupervisor} onCheckedChange={(c) => setOptions({...options, sendToSupervisor: c})} />
                    <label htmlFor="sup" className="text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Send to Safety Supervisor
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="draft" checked={options.saveAsDraft} onCheckedChange={(c) => setOptions({...options, saveAsDraft: c})} />
                    <label htmlFor="draft" className="text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Save as Draft
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button variant="ghost" onClick={onCancel} className="flex-1 text-slate-500 hover:text-slate-900">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => onSubmit({
                      ...editedData, 
                      department_id: selectedDept,
                      site_id: selectedSite,
                      advancedMedia: advancedMedia
                    }, options)} 
                    className="flex-[2] bg-[#FFC107] text-black font-bold hover:bg-[#FFD54F]"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}