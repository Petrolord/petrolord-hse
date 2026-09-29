import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHSE } from '@/context/HSEContext';
import { hseService } from '@/services/hseService';
import { notificationService } from '@/services/notificationService'; // Imported
import { departmentService } from '@/services/departmentService';
import { siteService } from '@/services/siteService'; 
import { locationService } from '@/services/locationService';
import { offlineManager } from '@/lib/offlineManager';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, AlertTriangle, Eye, Activity, AlertCircle, X, FileText, Save, RefreshCw, Plus, Lightbulb, MapPin, Search, CloudOff, Loader2 } from 'lucide-react';

import InteractiveMap from '@/components/sites/InteractiveMap';
import LocationAutocomplete from '@/components/sites/LocationAutocomplete';
import ReportTemplates from '@/components/hse/ReportTemplates'; 

// The wizard opens in the layout's dialog on every module, on the theme
// roles. Choices are marked with the primary role; severity uses the status
// roles next to its word.

const THEMED_SEVERITY = {
  Critical: 'bg-pl-danger-bg border-pl-danger',
  High: 'bg-pl-danger-bg border-pl-danger',
  Medium: 'bg-pl-warning-bg border-pl-warning',
  Low: 'bg-pl-success-bg border-pl-success',
};

const STEPS = [
  { id: 1, title: "Report Type" },
  { id: 2, title: "Location" },
  { id: 3, title: "Details" },
  { id: 4, title: "Category" },
  { id: 5, title: "Severity" },
  { id: 6, title: "Controls" },
  { id: 7, title: "Media" },
  { id: 8, title: "People" },
  { id: 9, title: "Actions" },
  { id: 10, title: "Review" }
];

const REPORT_TYPES = [
  { id: 'Safety Observation', label: 'Safety Observation', desc: 'Unsafe act or condition observed.', color: 'text-blue-400', border: 'hover:border-blue-400' },
  { id: 'Near Miss', label: 'Near Miss', desc: 'Event that could have caused harm.', color: 'text-yellow-400', border: 'hover:border-yellow-400' },
  { id: 'Incident', label: 'Incident', desc: 'Event resulting in injury or damage.', color: 'text-red-400', border: 'hover:border-red-400' },
  { id: 'Hazard Identification', label: 'Hazard ID', desc: 'Potential source of harm.', color: 'text-orange-400', border: 'hover:border-orange-400' },
  { id: 'Environmental', label: 'Environmental', desc: 'Spill, release, or env. impact.', color: 'text-green-400', border: 'hover:border-green-400' },
  { id: 'Security', label: 'Security', desc: 'Breach, theft, or unauthorized access.', color: 'text-purple-400', border: 'hover:border-purple-400' },
  { id: 'Health', label: 'Health', desc: 'Hygiene, illness, or ergonomic issue.', color: 'text-pink-400', border: 'hover:border-pink-400' },
  { id: 'BIAV', label: 'BIAV', desc: 'Behavior Interventions & Values.', color: 'text-indigo-400', border: 'hover:border-indigo-400' },
  { id: 'Community', label: 'Community', desc: 'Grievance or local community issue.', color: 'text-teal-400', border: 'hover:border-teal-400' },
];

const HAZARD_CATEGORIES = [
  "Slip, Trip, Fall", "Working at Height", "Falling Objects", "Lifting / Manual Handling", 
  "Chemical Exposure", "Electrical", "Fire / Explosion", "Confined Space", 
  "Vehicle / Transport", "Machinery / Equipment", "PPE Violation", "Housekeeping",
  "Noise / Vibration", "Fatigue / Stress", "Weather / Environment", "Other"
];

export default function ReportWizard({ onSuccess, onCancel, initialType = '' }) {
  const { currentOrganization, currentUser, isFeatureAvailable, isLoading: isHSELoading } = useHSE();
  const { toast } = useToast();
  
  // Use step 0 for template selection
  const [currentStep, setCurrentStep] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const [cachedOrgId, setCachedOrgId] = useState(() => {
    return currentOrganization?.id || localStorage.getItem('petrolord_last_org_id') || null;
  });

  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [siteLocations, setSiteLocations] = useState([]); 

  const [formData, setFormData] = useState({
    report_type: initialType || 'Safety Observation', 
    site_id: '',
    department_id: '',
    location_detail: '',
    incident_date: new Date().toISOString().slice(0, 16),
    title: '',
    description: '',
    hazard_category: '',
    severity: '',
    immediate_controls: '',
    attachments: [],
    people_involved: [],
    actions: [],
    is_anonymous: false,
    template_id: null 
  });

  const [newPerson, setNewPerson] = useState({ name: '', role: '', company: '' });
  const [newAction, setNewAction] = useState({ title: '', assigned_to: '', due_date: '', priority: 'Medium' });
  
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteCoords, setNewSiteCoords] = useState(null);
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (initialType) {
        setFormData(prev => ({ ...prev, report_type: initialType }));
        setCurrentStep(1);
    }
  }, [initialType]);

  useEffect(() => {
    const resolveOrg = async () => {
        if (currentOrganization?.id) {
            setCachedOrgId(currentOrganization.id);
            localStorage.setItem('petrolord_last_org_id', currentOrganization.id);
            return;
        }
        if (cachedOrgId) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: orgUser } = await supabase
                .from('organization_users')
                .select('organization_id')
                .eq('user_id', user.id)
                .limit(1)
                .single();
            
            if (orgUser?.organization_id) {
                setCachedOrgId(orgUser.organization_id);
                localStorage.setItem('petrolord_last_org_id', orgUser.organization_id);
            }
        }
    };
    resolveOrg();
  }, [currentOrganization, cachedOrgId]);

  useEffect(() => {
    if (cachedOrgId) {
        loadInitialData(cachedOrgId);
        if (!initialType && currentStep > 0) restoreDraft(cachedOrgId);
    }
  }, [cachedOrgId]);

  useEffect(() => {
    if (formData.site_id) {
        loadSiteLocations(formData.site_id);
    } else {
        setSiteLocations([]);
    }
  }, [formData.site_id]);

  useEffect(() => {
    if (cachedOrgId && currentUser && formData.title && currentStep > 0) {
        const timer = setTimeout(saveDraft, 2000);
        return () => clearTimeout(timer);
    }
  }, [formData, cachedOrgId, currentUser, currentStep]);

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
        ...prev,
        title: template.name,
        description: template.description || '',
        hazard_category: template.category,
        severity: template.severity?.toLowerCase() || 'medium',
        immediate_controls: template.controls || '',
        template_id: template.id
    }));
    setCurrentStep(1); 
  };

  const restoreDraft = (orgId) => {
    if (!currentUser) return;
    const key = `hse_draft_${orgId}_${currentUser.id}`;
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
        try {
            const parsed = JSON.parse(savedDraft);
            setFormData(prev => ({ ...prev, ...parsed }));
            if (parsed.report_type) {
                toast({ title: "Draft Restored", description: "Continuing from where you left off." });
            }
        } catch (e) { console.error("Draft parse error", e); }
    }
  };

  const loadInitialData = async (orgId) => {
    if (!orgId) return;
    try {
      const [sitesRes, deptsRes, usersRes] = await Promise.allSettled([
        hseService.getSites(orgId),
        departmentService.getActiveDepartments(orgId),
        supabase.from('organization_users').select('user_id, users:user_id(email, raw_user_meta_data)').eq('organization_id', orgId)
      ]);

      setSites(sitesRes.status === 'fulfilled' ? (sitesRes.value || []) : []);
      setDepartments(deptsRes.status === 'fulfilled' ? (deptsRes.value || []) : []);
      
      let users = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
          users = usersRes.value.data.map(u => ({ 
              id: u.user_id, 
              email: u.users?.email, 
              name: u.users?.raw_user_meta_data?.full_name || u.users?.email
          }));
      }
      
      // Ensure current user is in the list (fallback for RLS issues or missing data)
      if (currentUser && !users.find(u => u.id === currentUser.id)) {
          users.push({ 
              id: currentUser.id, 
              email: currentUser.email, 
              name: currentUser.name || currentUser.email || 'Me' 
          });
      }
      
      setOrgUsers(users);

    } catch (err) {
      console.error("Failed to load metadata, continuing in offline mode", err);
      // Even if network fails, try to set current user for dropdowns
      if (currentUser) {
          setOrgUsers([{ id: currentUser.id, email: currentUser.email, name: currentUser.name || 'Me' }]);
      }
    }
  };

  const loadSiteLocations = async (siteId) => {
    try {
        const locations = await locationService.getLocations(siteId);
        setSiteLocations(locations || []);
    } catch (e) { console.error("Failed to load locations", e); }
  }

  const saveDraft = () => {
    if (cachedOrgId && currentUser) {
        localStorage.setItem(`hse_draft_${cachedOrgId}_${currentUser.id}`, JSON.stringify(formData));
        setLastSaved(new Date());
    }
  };

  const clearDraft = () => {
    if (cachedOrgId && currentUser) {
        localStorage.removeItem(`hse_draft_${cachedOrgId}_${currentUser.id}`);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && value.length > 5 && cachedOrgId && navigator.onLine) {
      checkDuplicates(value, cachedOrgId);
    }
  };

  const checkDuplicates = async (title, orgId) => {
    try {
        const dups = await hseService.checkDuplicates(orgId, title);
        setDuplicates(dups || []);
    } catch (e) {
        console.warn("Duplicate check failed", e);
    }
  };

  const handleSiteSelect = (site) => {
      if (!site) {
          updateField('site_id', ''); 
          return;
      }
      updateField('site_id', site.id);
      toast({ title: "Site Selected", description: site.name });
  };

  const handleLocationSelect = (location) => {
      updateField('location_detail', location.name);
      toast({ title: "Location Selected", description: `${location.name} (${location.location_type})` });
  };

  const handleAutocompleteSelect = (item) => {
      if (item.id) updateField('site_id', item.id);
      if (item.address) updateField('location_detail', item.address);
  };

  const handleMapClick = async (latlng) => {
      setNewSiteCoords(latlng);
      setIsQuickAddOpen(true);
      try {
          const result = await siteService.reverseGeocode(latlng.lat, latlng.lng);
          if (result && result.display_name) {
              setNewSiteAddress(result.display_name);
          }
      } catch (e) { console.error("Geocode failed", e); }
  };

  const handleCreateSite = async () => {
    if(!newSiteName) {
        toast({ title: "Validation Error", description: "Site name is required.", variant: "destructive" });
        return;
    }
    
    setIsCreatingSite(true);
    const orgIdToUse = cachedOrgId;

    try {
        let newSite;
        if (orgIdToUse && navigator.onLine) {
            try {
                const lat = newSiteCoords ? newSiteCoords.lat : (mapCenter ? mapCenter.lat : 0);
                const lng = newSiteCoords ? newSiteCoords.lng : (mapCenter ? mapCenter.lng : 0);

                newSite = await hseService.createSite({ 
                    org_id: orgIdToUse, 
                    name: newSiteName,
                    address: newSiteAddress,
                    latitude: lat,
                    longitude: lng,
                    metadata: { source: 'report_wizard_map' }
                });
            } catch (apiError) {
                console.warn("Online site creation failed, falling back to local:", apiError);
            }
        }

        if (!newSite) {
            newSite = {
                id: `temp_site_${Date.now()}`,
                name: newSiteName,
                address: newSiteAddress,
                latitude: newSiteCoords?.lat || 0,
                longitude: newSiteCoords?.lng || 0,
                is_local: true,
                organization_id: orgIdToUse || 'temp_org'
            };
            toast({ 
                title: "Site Added Locally", 
                description: "Site created in offline mode.",
                ...{}
            });
        } else {
            toast({ title: "Site Created", description: `${newSite.name} added successfully.` });
        }

        setSites(prev => [...prev, newSite]);
        setFormData(prev => ({ ...prev, site_id: newSite.id }));
        setSiteLocations([]); 
        
        setNewSiteName('');
        setNewSiteCoords(null);
        setNewSiteAddress('');
        setIsQuickAddOpen(false);
        
    } catch(e) {
        console.error(e);
        toast({ title: "Creation Failed", description: "Could not create site. Try again later.", variant: "destructive" });
    } finally {
        setIsCreatingSite(false);
    }
  };

  const addPerson = () => {
    if (!newPerson.name) return;
    setFormData(prev => ({ ...prev, people_involved: [...prev.people_involved, { ...newPerson, id: Date.now() }] }));
    setNewPerson({ name: '', role: '', company: '' });
  };

  const addAction = () => {
    if (!newAction.title) return;
    setFormData(prev => ({ ...prev, actions: [...prev.actions, { ...newAction, id: Date.now() }] }));
    setNewAction({ title: '', assigned_to: '', due_date: '', priority: 'Medium' });
  };

  const validateStep = (step) => {
    switch(step) {
      case 1: return !!formData.report_type;
      case 2: return !!formData.site_id && !!formData.incident_date;
      case 3: return !!formData.title && !!formData.description;
      case 4: return !!formData.hazard_category;
      case 5: return !!formData.severity;
      default: return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast({ title: "Required Fields", description: "Please complete all required fields marked with *.", variant: "destructive" });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 10));
  };

  const handleSubmit = async () => {
    const finalOrgId = cachedOrgId;
    setIsSubmitting(true);
    
    // Feedback: Submitting
    toast({ 
        title: "Submitting Report...", 
        description: "Please wait while we process your submission.",
        duration: 3000
    });

    const reportPayload = {
        organization_id: finalOrgId, 
        created_by: formData.is_anonymous ? null : currentUser?.id,
        report_type: formData.report_type,
        site_id: formData.site_id,
        title: formData.title,
        description: formData.description,
        location_detail: formData.location_detail,
        incident_date: new Date(formData.incident_date).toISOString(),
        hazard_category: formData.hazard_category,
        severity: formData.severity,
        immediate_controls: formData.immediate_controls,
        people_involved: formData.people_involved,
        is_anonymous: formData.is_anonymous,
        status: 'open',
        attachments: formData.attachments, 
        reference_code: `HSE-${Date.now().toString().slice(-6)}`,
        template_id: formData.template_id
    };

    try {
      if (navigator.onLine && finalOrgId) {
          const report = await hseService.createReport(reportPayload);
          
          // --- NOTIFICATION LOGIC START ---
          // 1. Notify Assigned Users for Actions
          if (formData.actions.length > 0) {
            for (const action of formData.actions) {
              await hseService.createAction({
                report_id: report.id,
                organization_id: finalOrgId,
                title: action.title,
                assigned_to: action.assigned_to || null,
                due_date: action.due_date ? new Date(action.due_date).toISOString() : null,
                priority: action.priority,
                status: 'open'
              });
              
              // Trigger notification if assigned
              if(action.assigned_to) {
                 await notificationService.createNotification({
                    userId: action.assigned_to,
                    organizationId: finalOrgId,
                    title: 'Action Assigned',
                    message: `You have been assigned an action: "${action.title}" (Ref: ${report.reference_code})`,
                    type: 'alert',
                    link: `/dashboard/actions`,
                    reportId: report.id,
                    reportType: 'incident',
                    createdBy: currentUser?.id
                 });
              }
            }
          }
          
          // 2. Notify Admins if Incident is Critical or High
          if (formData.severity === 'critical' || formData.severity === 'high') {
             await notificationService.notifyAdmins(finalOrgId, {
                title: `New ${formData.severity.toUpperCase()} Incident`,
                message: `${formData.report_type} reported at ${sites.find(s => s.id === formData.site_id)?.name || 'site'}: ${formData.title}`,
                type: 'alert',
                link: `/dashboard/incidents?id=${report.id}`,
                reportId: report.id,
                reportType: 'incident',
                createdBy: currentUser?.id
             });
          }
          // --- NOTIFICATION LOGIC END ---

          // Points are awarded by the database for Quick Reports only
          // (migration 20260929120000_hse_points_ledger); the wizard's
          // records earn none, so there is no client points call here.

          // Enhanced Toast
          toast({ 
            title: "Submitted Successfully! 🎉", 
            description: `Reference: ${report.reference_code}.`,
            ...{ variant: 'success' }
          });
      } else {
          await offlineManager.saveIncident(reportPayload);
          toast({ 
              title: "Saved Offline (Connection Issue)", 
              description: "We'll automatically sync this report when you're back online.",
              variant: "warning"
          });
      }
      clearDraft();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      try {
          await offlineManager.saveIncident(reportPayload);
          toast({ 
              title: "Submission Failed - Saved Offline", 
              description: "An error occurred, but we've saved your report locally.",
              variant: "destructive"
          });
          if (onSuccess) onSuccess();
      } catch (e) {
          toast({ title: "Submission Failed", description: error.message || "Unknown error occurred", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowUpload = isFeatureAvailable ? isFeatureAvailable('images') : true;
    if (!allowUpload) {
        toast({ title: "Premium Feature", description: "Upgrade plan to upload media.", variant: "destructive" });
        return;
    }
    const newFile = { id: Date.now(), name: file.name, type: file.type, size: (file.size/1024).toFixed(1)+'KB', url: '#' };
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newFile] }));
    toast({ title: "File Attached", description: file.name });
  };

  const isContextMissing = !cachedOrgId && !isHSELoading && !currentOrganization;

  return (
    <div className="max-w-5xl mx-auto py-2">
      {isContextMissing && (
          <div className="mb-4 bg-pl-warning-bg border border-pl-warning/40 p-3 rounded-lg flex items-center gap-3">
              <CloudOff className="h-5 w-5 text-pl-warning-text" />
              <div className="flex-1">
                  <p className="text-sm font-medium text-pl-warning-text">Offline / No Context Mode</p>
                  <p className="text-xs text-pl-muted">Organization data is unavailable. Reports will be saved locally and synced later.</p>
              </div>
          </div>
      )}

      {currentStep > 0 ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-pl-text">New HSE Report</h2>
              <p className="text-pl-muted text-sm">Step {currentStep} of 10: {STEPS[currentStep-1].title}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-pl-muted">
              {lastSaved && <span className="flex items-center gap-1"><Save className="h-3 w-3"/> Draft saved {lastSaved.toLocaleTimeString()}</span>}
              <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Close the wizard"><X className="h-4 w-4"/></Button>
            </div>
          </div>

          <div className="w-full bg-pl-border h-1.5 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-pl-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <Card className="min-h-[500px] flex flex-col">
            <CardContent className="flex-1 py-6">
              <AnimatePresence mode="wait">
                
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {REPORT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateField('report_type', type.id)}
                          aria-pressed={formData.report_type === type.id}
                          className={`p-4 rounded-xl border-2 flex flex-col items-start gap-3 transition-all duration-200 group text-left ${formData.report_type === type.id ? 'border-pl-primary bg-pl-primary/10' : 'border-pl-border bg-pl-surface hover:border-pl-border-strong'}`}
                        >
                          <div className="p-2 rounded-full bg-pl-sunken">
                            {['Incident','Fire'].some(k => type.id.includes(k)) ? <AlertTriangle className="h-6 w-6 text-pl-muted" /> : 
                             ['Safe','Health'].some(k => type.id.includes(k)) ? <Activity className="h-6 w-6 text-pl-muted" /> :
                             <Eye className="h-6 w-6 text-pl-muted" />}
                          </div>
                          <div>
                            <span className="block font-semibold text-pl-text mb-1">{type.label}</span>
                            <span className="text-xs text-pl-muted">{type.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2 - Location */}
                {currentStep === 2 && (
                  <motion.div key="step2" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="space-y-4">
                        <Label>Site / Location <span className="text-pl-danger-text">*</span></Label>
                        
                        <Tabs defaultValue="map" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="map">
                                    <MapPin className="h-4 w-4 mr-2" /> Map View
                                </TabsTrigger>
                                <TabsTrigger value="search">
                                    <Search className="h-4 w-4 mr-2" /> Search
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="map" className="mt-2 relative">
                                <InteractiveMap 
                                    sites={sites} 
                                    locations={siteLocations}
                                    selectedSiteId={formData.site_id}
                                    onSiteSelect={handleSiteSelect}
                                    onLocationSelect={handleLocationSelect}
                                    onAddNewSite={() => {
                                        setNewSiteCoords(mapCenter);
                                        setIsQuickAddOpen(true);
                                    }}
                                    onCenterChange={setMapCenter}
                                    onMapClick={handleMapClick}
                                    height="400px"
                                />
                                
                                {isQuickAddOpen && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] bg-pl-raised text-pl-text p-4 rounded-lg shadow-pl-lg border border-pl-border w-80 max-w-[calc(100%-2rem)]">
                                        <h4 className="text-sm font-semibold text-pl-text mb-2">Create New Site</h4>
                                        <p className="text-xs text-pl-muted mb-2">
                                            Location: {newSiteCoords ? `${newSiteCoords.lat.toFixed(4)}, ${newSiteCoords.lng.toFixed(4)}` : 'Map Center'}
                                        </p>
                                        <Input 
                                            placeholder="Site Name" 
                                            value={newSiteName} 
                                            onChange={e => setNewSiteName(e.target.value)} 
                                            className="mb-2"
                                        />
                                        <Textarea 
                                            placeholder="Address / Description" 
                                            value={newSiteAddress}
                                            onChange={e => setNewSiteAddress(e.target.value)}
                                            className="mb-2 h-20 text-xs"
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={handleCreateSite} disabled={isCreatingSite}>
                                                {isCreatingSite ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => setIsQuickAddOpen(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="search" className="mt-2 h-[400px] flex flex-col">
                                <div className="flex-1 bg-pl-sunken p-4 sm:p-6 rounded-lg border border-pl-border">
                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="text-center mb-6">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pl-surface border border-pl-border mb-3">
                                                <Search className="h-6 w-6 text-pl-muted" />
                                            </div>
                                            <h3 className="text-lg font-medium text-pl-text">Find Location</h3>
                                            <p className="text-sm text-pl-muted">Search existing sites or locations</p>
                                        </div>
                                        <LocationAutocomplete 
                                            onSelect={handleAutocompleteSelect}
                                            onAddNew={() => {
                                                setNewSiteCoords(null);
                                                setIsQuickAddOpen(true);
                                            }}
                                            placeholder="e.g. Headquarters, Warehouse A..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {formData.site_id && (
                            <div className="flex items-center justify-between gap-3 p-3 bg-pl-success-bg border border-pl-success/40 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-pl-success-text" />
                                    <div>
                                        <p className="text-sm font-medium text-pl-text">
                                            Selected Site: <span className="font-semibold text-pl-text">{sites.find(s => s.id === formData.site_id)?.name || 'Unknown'}</span>
                                        </p>
                                        {formData.location_detail && (
                                            <p className="text-xs text-pl-muted">Detail: {formData.location_detail}</p>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => { updateField('site_id', ''); updateField('location_detail', ''); }}
                                >
                                    Change
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={formData.department_id} onValueChange={(val) => updateField('department_id', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                        <SelectContent>
                            {departments.length > 0 ? (
                                departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                            ) : (
                                <div className="p-2 text-xs text-center text-pl-muted">No active departments</div>
                            )}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Date & Time <span className="text-pl-danger-text">*</span></Label>
                        <Input 
                            type="datetime-local"
                            value={formData.incident_date}
                            onChange={(e) => updateField('incident_date', e.target.value)}
                        />
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label>Specific Location Detail</Label>
                    <Input 
                        placeholder="e.g. 3rd Floor, Pump Room B" 
                        value={formData.location_detail}
                        onChange={(e) => updateField('location_detail', e.target.value)}
                    />
                    </div>
                  </motion.div>
                )}

                {/* Step 3 - Details */}
                {currentStep === 3 && (
                  <motion.div key="step3" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="space-y-2 relative">
                    <Label>Title <span className="text-pl-danger-text">*</span></Label>
                    <Input 
                        placeholder="Brief headline..." 
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                    />
                    {duplicates.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-pl-raised border border-pl-warning/40 p-2 rounded z-10 shadow-pl-md">
                        <p className="text-xs text-pl-warning-text mb-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Similar reports found:</p>
                        {duplicates.map(d => (
                            <div key={d.id} className="text-xs text-pl-muted truncate border-b border-pl-border py-1 cursor-pointer hover:text-pl-text">
                            {d.reference_code}: {d.title}
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                    <div className="space-y-2">
                    <Label>What Happened? (Description) <span className="text-pl-danger-text">*</span></Label>
                    <div className="relative">
                        <Textarea 
                            placeholder="Detailed description..." 
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="min-h-[200px] font-sans"
                        />
                        <span className="text-xs text-pl-muted font-pl-mono tabular-nums absolute bottom-2 right-2">{formData.description.length} chars</span>
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 - Category */}
                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-lg font-medium text-pl-text mb-4">Select Hazard Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {HAZARD_CATEGORIES.map(cat => (
                        <button
                        key={cat}
                        onClick={() => updateField('hazard_category', cat)}
                        aria-pressed={formData.hazard_category === cat}
                        className={`p-3 text-sm rounded border transition-colors ${formData.hazard_category === cat ? 'bg-pl-primary text-pl-primary-fg border-pl-primary font-semibold' : 'bg-pl-surface border-pl-border text-pl-text hover:border-pl-border-strong'}`}
                        >
                        {cat}
                        </button>
                    ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 5 - Severity */}
                {currentStep === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Low', 'Medium', 'High', 'Critical'].map(level => (
                        <div 
                            key={level}
                            onClick={() => updateField('severity', level.toLowerCase())}
                            className={`cursor-pointer p-4 sm:p-6 rounded-xl border-2 flex flex-col items-center text-center gap-2 transition-all ${formData.severity === level.toLowerCase() ? THEMED_SEVERITY[level] : 'bg-pl-surface border-pl-border hover:border-pl-border-strong'}`}
                        >
                            <span className="text-xl font-semibold text-pl-text">{level}</span>
                            <p className="text-xs text-pl-muted">
                                {level === 'Low' ? 'No injury, minor damage.' :
                                level === 'Medium' ? 'First aid, localized damage.' :
                                level === 'High' ? 'Medical treatment, serious damage.' :
                                'Fatality, catastrophe, stop work.'}
                            </p>
                        </div>
                    ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 6 - Controls */}
                {currentStep === 6 && (
                  <motion.div key="step6" className="space-y-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <Label>Immediate Actions Taken</Label>
                    <Textarea 
                        placeholder="What was done to make the area safe?"
                        value={formData.immediate_controls}
                        onChange={(e) => updateField('immediate_controls', e.target.value)}
                        className="min-h-[150px]"
                    />
                    <div className="flex gap-2 text-xs text-pl-muted">
                        <Lightbulb className="h-4 w-4" />
                        <span>Tip: Mention who took the action and when.</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 7 - Media */}
                {currentStep === 7 && (
                  <motion.div key="step7" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-pl-border-strong border-dashed rounded-lg cursor-pointer bg-pl-sunken hover:bg-pl-surface transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-pl-muted" />
                                <p className="mb-2 text-sm text-pl-text"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-pl-muted">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                        </label>
                    </div>
                    <div className="space-y-2">
                        {formData.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-pl-sunken rounded border border-pl-border">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-pl-muted"/>
                                    <div>
                                        <p className="text-sm font-medium text-pl-text">{file.name}</p>
                                        <p className="text-xs text-pl-muted">{file.size}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const newAtt = [...formData.attachments];
                                    newAtt.splice(idx, 1);
                                    setFormData({...formData, attachments: newAtt});
                                }}><X className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 8 - People */}
                {currentStep === 8 && (
                  <motion.div key="step8" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-pl-sunken border border-pl-border p-4 rounded-lg">
                        <Input placeholder="Name" value={newPerson.name} onChange={e => setNewPerson({...newPerson, name: e.target.value})} />
                        <Input placeholder="Role (e.g. Witness)" value={newPerson.role} onChange={e => setNewPerson({...newPerson, role: e.target.value})} />
                        <div className="flex gap-2">
                            <Input placeholder="Company" value={newPerson.company} onChange={e => setNewPerson({...newPerson, company: e.target.value})} />
                            <Button onClick={addPerson} variant="secondary" aria-label="Add person"><Plus className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {formData.people_involved.map((p) => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-pl-sunken rounded border border-pl-border">
                                <span><span className="font-semibold text-pl-text">{p.name}</span> <span className="text-pl-muted">({p.role})</span></span>
                                <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, people_involved: formData.people_involved.filter(x => x.id !== p.id)})}><X className="h-4 w-4"/></Button>
                            </div>
                        ))}
                        {formData.people_involved.length === 0 && <p className="text-center text-pl-muted py-4">No people added yet.</p>}
                    </div>
                  </motion.div>
                )}

                {/* Step 9 - Actions */}
                {currentStep === 9 && (
                  <motion.div key="step9" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="space-y-4 bg-pl-sunken border border-pl-border p-4 rounded-lg">
                        <Input placeholder="Action Title" value={newAction.title} onChange={e => setNewAction({...newAction, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <Select value={newAction.assigned_to} onValueChange={v => setNewAction({...newAction, assigned_to: v})}>
                                <SelectTrigger><SelectValue placeholder="Assign To" /></SelectTrigger>
                                <SelectContent>
                                    {orgUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input type="date" value={newAction.due_date} onChange={e => setNewAction({...newAction, due_date: e.target.value})} />
                        </div>
                        <Button onClick={addAction} variant="secondary" className="w-full">Add Action</Button>
                    </div>
                    <div className="space-y-2">
                        {formData.actions.map((a) => (
                            <div key={a.id} className="p-3 bg-pl-sunken rounded border border-pl-border flex justify-between">
                                <div>
                                    <p className="font-semibold text-pl-text">{a.title}</p>
                                    <p className="text-xs text-pl-muted">Due: {a.due_date || 'n/a'}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, actions: formData.actions.filter(x => x.id !== a.id)})}><X className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 10 - Review */}
                {currentStep === 10 && (
                  <motion.div key="step10" className="space-y-6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-pl-sunken p-4 sm:p-6 rounded-xl border border-pl-border space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-pl-text">{formData.title}</h3>
                                <Badge className="mt-2">{formData.report_type}</Badge>
                            </div>
                            <div className="text-right text-xs text-pl-muted">
                                <p>{new Date(formData.incident_date).toLocaleString()}</p>
                                <p>{sites.find(s => s.id === formData.site_id)?.name}</p>
                            </div>
                        </div>
                        <div className="border-t border-pl-border pt-4">
                            <Label className="text-pl-muted">Description</Label>
                            <p className="text-pl-text mt-1">{formData.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-pl-muted">Category:</span> <span className="text-pl-text">{formData.hazard_category}</span></div>
                            <div><span className="text-pl-muted">Severity:</span> <span className="text-pl-text capitalize">{formData.severity}</span></div>
                            <div><span className="text-pl-muted">People:</span> <span className="text-pl-text">{formData.people_involved.length}</span></div>
                            <div><span className="text-pl-muted">Actions:</span> <span className="text-pl-text">{formData.actions.length}</span></div>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-pl-border">
                            <Switch checked={formData.is_anonymous} onCheckedChange={c => updateField('is_anonymous', c)} />
                            <Label>Submit Anonymously</Label>
                        </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between gap-3 border-t border-pl-border pt-6">
              <Button variant="outline" onClick={currentStep <= 1 ? onCancel : () => setCurrentStep(p => p - 1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> {currentStep <= 1 ? 'Cancel' : 'Back'}
              </Button>
              {currentStep < 10 && currentStep > 0 ? (
                <Button onClick={nextStep} className="font-semibold">
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : currentStep === 0 ? (
                 null // Handled by template select
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="font-semibold px-8">
                  {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Submit Report
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Template Overlay */}
          <AnimatePresence>
            {currentStep === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-pl-bg/95 z-50 flex items-center justify-center p-4"
                >
                    <Card className="w-full max-w-4xl shadow-pl-lg">
                        <CardContent className="p-8">
                            <ReportTemplates 
                                onSelect={handleTemplateSelect} 
                                onSkip={() => setCurrentStep(1)} 
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
}