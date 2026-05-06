import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { permitsService } from '@/services/permitsService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HAZARDS_LIST = [
  "Working at Height", "Confined Space", "Hot Work (Welding/Cutting)", 
  "Electrical Hazard", "Chemical Exposure", "Heavy Lifting", 
  "High Pressure", "Moving Machinery", "Noise", "Dust/Fumes"
];

const PPE_LIST = [
  "Safety Helmet", "Safety Boots", "High-Vis Vest", "Safety Glasses", 
  "Ear Protection", "Gloves", "Respiratory Mask", "Full Body Harness", 
  "Face Shield", "Coveralls"
];

export default function PermitForm({ onSuccess, onCancel, users }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [formData, setFormData] = useState({
    permit_type: '',
    title: '',
    description: '',
    location: '',
    department: '',
    priority: 'Medium',
    start_date: '',
    end_date: '',
    supervisor_id: '',
    contractor_name: '',
    risk_level: 'Low',
    hazards: [],
    ppe_requirements: [],
    emergency_procedures: '',
    status: 'Draft'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes changes
    if (errorMsg) setErrorMsg(null);
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(item) 
          ? current.filter(i => i !== item)
          : [...current, item]
      };
    });
  };

  const validateForm = (isDraft) => {
    const errors = [];
    
    // Basic checks for Drafts
    if (!formData.title?.trim()) errors.push("Permit Title is required.");
    if (!formData.permit_type) errors.push("Permit Type is required.");

    // Strict checks for Submission
    if (!isDraft) {
      if (!formData.location?.trim()) errors.push("Location is required.");
      if (!formData.department?.trim()) errors.push("Department is required.");
      if (!formData.supervisor_id) errors.push("Site Supervisor (Approver) is required.");
      if (!formData.start_date) errors.push("Start Date is required.");
      if (!formData.end_date) errors.push("End Date is required.");
      if (!formData.description?.trim()) errors.push("Description of work is required.");
      
      if (formData.start_date && formData.end_date) {
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
          errors.push("End Date must be after Start Date.");
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!currentOrganization) return;
    setErrorMsg(null);

    // 1. Validate
    const validationErrors = validateForm(isDraft);
    if (validationErrors.length > 0) {
      const message = validationErrors[0];
      setErrorMsg(message);
      toast({
        title: "Validation Error",
        description: message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // 2. Prepare Payload
      // Ensure empty strings for UUIDs are converted to null
      const payload = {
        ...formData,
        status: isDraft ? 'Draft' : 'Submitted',
        organization_id: currentOrganization.id,
        created_by: currentUser.id,
        requested_by: currentUser.id, // Ensure this maps to a valid user UUID
        expiry_date: formData.end_date || null,
        supervisor_id: formData.supervisor_id || null, // Convert '' to null for DB UUID type
      };

      console.log("Submitting Permit Payload:", payload);

      // 3. Submit
      await permitsService.createPermit(payload);
      
      toast({
        title: isDraft ? "Draft Saved" : "Permit Submitted",
        description: isDraft ? "You can continue editing later." : "Your permit request has been submitted for approval.",
        className: "bg-green-600 text-white border-none"
      });
      onSuccess();
    } catch (error) {
      console.error("Create Permit Error:", error);
      // Extract meaningful message
      const serverMessage = error.message || error.error_description || error.details || "Unknown database error";
      
      setErrorMsg(`Failed to create permit: ${serverMessage}`);
      
      toast({ 
        title: "Error Creating Permit", 
        description: serverMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Permit Type <span className="text-red-500">*</span></Label>
          <Select value={formData.permit_type} onValueChange={(v) => handleInputChange('permit_type', v)}>
            <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
              <SelectItem value="Hot Work">Hot Work</SelectItem>
              <SelectItem value="Cold Work">Cold Work</SelectItem>
              <SelectItem value="Confined Space">Confined Space</SelectItem>
              <SelectItem value="Height Work">Height Work</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Excavation">Excavation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => handleInputChange('priority', v)}>
            <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Title <span className="text-red-500">*</span></Label>
        <Input 
          placeholder="e.g., Welding on Pipeline B" 
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="bg-[#252541] border-[#3a3a5a] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Description of Work <span className="text-red-500">*</span></Label>
        <Textarea 
          placeholder="Describe the task in detail..." 
          className="h-24 bg-[#252541] border-[#3a3a5a] text-white"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Location <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="Area / Site" 
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="bg-[#252541] border-[#3a3a5a] text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Department <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="Department" 
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="bg-[#252541] border-[#3a3a5a] text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base text-gray-300">Identified Hazards</Label>
        <div className="grid grid-cols-2 gap-3">
          {HAZARDS_LIST.map(hazard => (
            <div key={hazard} className="flex items-center space-x-2">
              <Checkbox 
                id={`hz-${hazard}`} 
                checked={formData.hazards.includes(hazard)}
                onCheckedChange={() => handleArrayToggle('hazards', hazard)}
                className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor={`hz-${hazard}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                {hazard}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-[#3a3a5a]" />

      <div className="space-y-3">
        <Label className="text-base text-gray-300">Required PPE</Label>
        <div className="grid grid-cols-2 gap-3">
          {PPE_LIST.map(ppe => (
            <div key={ppe} className="flex items-center space-x-2">
              <Checkbox 
                id={`ppe-${ppe}`} 
                checked={formData.ppe_requirements.includes(ppe)}
                onCheckedChange={() => handleArrayToggle('ppe_requirements', ppe)}
                className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor={`ppe-${ppe}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                {ppe}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Risk Level Assessment</Label>
        <Select value={formData.risk_level} onValueChange={(v) => handleInputChange('risk_level', v)}>
          <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
            <SelectItem value="Low">Low Risk</SelectItem>
            <SelectItem value="Medium">Medium Risk</SelectItem>
            <SelectItem value="High">High Risk</SelectItem>
            <SelectItem value="Critical">Critical Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Start Date & Time <span className="text-red-500">*</span></Label>
          <Input 
            type="datetime-local" 
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="bg-[#252541] border-[#3a3a5a] text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">End Date & Time <span className="text-red-500">*</span></Label>
          <Input 
            type="datetime-local" 
            value={formData.end_date}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            className="bg-[#252541] border-[#3a3a5a] text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Site Supervisor (Approver) <span className="text-red-500">*</span></Label>
        <Select value={formData.supervisor_id} onValueChange={(v) => handleInputChange('supervisor_id', v)}>
          <SelectTrigger className={`bg-[#252541] border-[#3a3a5a] text-white ${!formData.supervisor_id ? 'border-amber-500/50' : ''}`}>
            <SelectValue placeholder="Select supervisor" />
          </SelectTrigger>
          <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
            {users.length === 0 ? (
               <SelectItem value="no-users" disabled>No users found in organization</SelectItem>
            ) : (
              users.map(u => (
                <SelectItem key={u.id} value={u.id}>
                  {u.raw_user_meta_data?.full_name || u.email}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {!formData.supervisor_id && (
            <p className="text-xs text-amber-500">Required for approval workflow.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Contractor Company (Optional)</Label>
        <Input 
          placeholder="Contractor Name" 
          value={formData.contractor_name}
          onChange={(e) => handleInputChange('contractor_name', e.target.value)}
          className="bg-[#252541] border-[#3a3a5a] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Emergency Procedures</Label>
        <Textarea 
          placeholder="Emergency contact numbers, evacuation route..." 
          className="h-24 bg-[#252541] border-[#3a3a5a] text-white"
          value={formData.emergency_procedures}
          onChange={(e) => handleInputChange('emergency_procedures', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Card className="border-[var(--border-color)] bg-[var(--bg-app)]">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {step === 1 && "General Information"}
                {step === 2 && "Hazards & Controls"}
                {step === 3 && "Schedule & Team"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-color)] bg-[#1a1a2e] flex justify-between items-center">
        <Button variant="ghost" onClick={onCancel} disabled={loading} className="text-gray-400 hover:text-white">Cancel</Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading} className="border-[#3a3a5a] text-white hover:bg-[#252541]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={loading} className="bg-[#252541] hover:bg-[#3a3a5a] text-white">
                <Save className="mr-2 h-4 w-4" /> Save Draft
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSubmit(false)} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Permit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}