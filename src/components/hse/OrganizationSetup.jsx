import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader, ArrowLeft, ArrowRight, Flag, X } from 'lucide-react';
import { fetchOrganization, updateOrganization, fetchOrganizationAssets, addAsset, deleteAsset } from '../../services/organizationService';
import { useAuth } from '../../contexts/SupabaseAuthContext';

export const OrganizationSetup = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [assets, setAssets] = useState([]);
  const [existingConfig, setExistingConfig] = useState({});

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    industry: '',
    employees: '',
    city: '',
    
    // Step 2: Contact Info
    website: '',
    phone: '',
    contact_email: '',
    
    // Step 3: Description
    description: '',
    
    // Step 5: Safety Settings
    safety_policy: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    if (user?.organization_id) {
      loadOrganization();
    }
  }, [user?.organization_id]);

  const loadOrganization = async () => {
    try {
      console.log('📦 [ORG SETUP] Loading organization:', user?.organization_id);
      setLoading(true);
      setError(null);

      if (!user?.organization_id) {
        throw new Error('No organization ID found');
      }

      const org = await fetchOrganization(user.organization_id);
      const orgAssets = await fetchOrganizationAssets(user.organization_id);
      
      console.log('✅ [ORG SETUP] Organization loaded:', org);
      
      const config = org.hse_config || {};
      setExistingConfig(config);
      setAssets(orgAssets || []);

      setFormData({
        name: org.name || '',
        industry: org.industry || '',
        employees: org.employees || org.num_employees || '',
        city: config.city || '',
        website: config.website || '',
        phone: config.phone || '',
        contact_email: org.contact_email || user.email || '',
        description: config.description || '',
        safety_policy: config.safety_policy || '',
        emergency_contact_name: config.emergency_contact_name || '',
        emergency_contact_phone: config.emergency_contact_phone || '',
      });
    } catch (err) {
      console.error('❌ [ORG SETUP] Error loading organization:', err);
      setError(err.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.name?.trim()) throw new Error('Organization name is required');
        if (!formData.industry) throw new Error('Industry is required');
        break;
      case 2:
        if (!formData.contact_email?.trim()) throw new Error('Contact email is required');
        break;
      case 3:
        if (!formData.description?.trim()) throw new Error('Description is required');
        break;
      case 5:
        if (!formData.emergency_contact_name?.trim()) throw new Error('Emergency contact name is required');
        if (!formData.emergency_contact_phone?.trim()) throw new Error('Emergency contact phone is required');
        break;
    }
  };

  const handleSaveStep = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      validateStep(step);

      // Map fields to columns or config
      const hse_config = {
        ...existingConfig,
        updated_at: new Date().toISOString(),
        // Map extra fields to config
        city: formData.city,
        website: formData.website,
        phone: formData.phone,
        description: formData.description,
        safety_policy: formData.safety_policy,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
      };

      const dataToSave = {
        name: formData.name.trim(),
        industry: formData.industry,
        num_employees: formData.employees ? parseInt(formData.employees) : null,
        contact_email: formData.contact_email,
        hse_config: hse_config,
      };

      console.log('💾 [ORG SETUP] Saving step data:', dataToSave);
      await updateOrganization(user.organization_id, dataToSave);
      
      setMessage({ type: 'success', text: `Step ${step} saved successfully!` });
      
      setTimeout(() => {
        if (step < 6) {
          setStep(step + 1);
        } else {
          if (onComplete) onComplete();
        }
        setMessage(null);
      }, 1000);

    } catch (err) {
      console.error('❌ [ORG SETUP] Error saving step:', err);
      setError(err.message || 'Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAsset = async () => {
    const name = window.prompt("Asset Name:");
    if(!name) return;
    const type = window.prompt("Asset Type/Category:");
    if(!type) return;

    try {
        setSaving(true);
        const newAsset = await addAsset(user.organization_id, {
            name,
            category: type,
            asset_id: `AST-${Date.now().toString().slice(-4)}`,
            safety_status: 'safe'
        });
        setAssets([...assets, newAsset]);
    } catch(err) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleDeleteAsset = async (id) => {
      if(!window.confirm("Delete this asset?")) return;
      try {
          setSaving(true);
          await deleteAsset(id);
          setAssets(assets.filter(a => a.id !== id));
      } catch(err) {
          setError(err.message);
      } finally {
          setSaving(false);
      }
  };

  const handleSkip = () => {
    if (window.confirm("Are you sure you want to exit setup? You can always complete this later in Settings.")) {
        if (onComplete) onComplete();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-yellow-500" />
          <p className="text-gray-400">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-xl relative">
          
          {/* Close / Exit Button */}
          <Button 
            onClick={handleSkip}
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Exit Setup"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="mb-8 pr-10">
            <h1 className="text-3xl font-bold mb-2">Organization Setup</h1>
            <p className="text-gray-400 mb-6">Step {step} of 6: 
              {step === 1 && ' Basic Information'}
              {step === 2 && ' Contact Information'}
              {step === 3 && ' Organization Details'}
              {step === 4 && ' Assets & Equipment'}
              {step === 5 && ' Safety Settings'}
              {step === 6 && ' Review & Complete'}
            </p>
            
            {/* Progress Bar */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-yellow-500' : 'bg-gray-700'}`} />
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div><p className="text-red-200 font-semibold">Error</p><p className="text-red-200 text-sm mt-1">{error}</p></div>
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-200">{message.text}</p>
            </div>
          )}

          {/* Steps Content */}
          <div className="space-y-6 mb-8 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name *</label>
                    <Input name="name" value={formData.name} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-10">
                      <option value="">Select Industry</option>
                      <option value="oil_gas">Oil & Gas</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="construction">Construction</option>
                      <option value="mining">Mining</option>
                      <option value="energy">Energy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Employees</label>
                    <Input name="employees" type="number" value={formData.employees} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City / Headquarters</label>
                    <Input name="city" value={formData.city} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email *</label>
                  <Input name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input name="website" value={formData.website} onChange={handleChange} className="bg-gray-700 border-gray-600" placeholder="https://" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white h-40 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Describe your organization's mission and operations..." />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Assets & Equipment</h3>
                    <Button onClick={handleAddAsset} variant="outline" className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20">
                        + Add Asset
                    </Button>
                </div>
                
                {assets.length === 0 ? (
                    <div className="text-center p-8 bg-gray-700/30 rounded-lg border border-dashed border-gray-600">
                        <p className="text-gray-400">No assets added yet.</p>
                        <p className="text-sm text-gray-500">Add critical equipment to track safety status.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                        {assets.map(asset => (
                            <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600">
                                <div>
                                    <p className="font-medium text-white">{asset.name}</p>
                                    <p className="text-xs text-gray-400">{asset.category} • {asset.asset_id || 'No ID'}</p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleDeleteAsset(asset.id)}>Delete</Button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium mb-2">Safety Policy Overview</label>
                  <textarea name="safety_policy" value={formData.safety_policy} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white h-24 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Brief summary of safety commitments..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Emergency Contact Name *</label>
                    <Input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Emergency Phone *</label>
                    <Input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="bg-gray-700 border-gray-600" />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Flag className="w-5 h-5 text-yellow-500"/> Review Details</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><span className="text-gray-400">Name:</span> <p>{formData.name}</p></div>
                        <div><span className="text-gray-400">Industry:</span> <p>{formData.industry}</p></div>
                        <div><span className="text-gray-400">Email:</span> <p>{formData.contact_email}</p></div>
                        <div><span className="text-gray-400">Employees:</span> <p>{formData.employees}</p></div>
                        <div><span className="text-gray-400">Assets Added:</span> <p>{assets.length}</p></div>
                        <div><span className="text-gray-400">Emergency Contact:</span> <p>{formData.emergency_contact_name}</p></div>
                    </div>
                </div>
                <p className="text-center text-gray-400 text-sm">Please review your information before finishing setup.</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-700">
            <Button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || saving}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                    Skip Setup
                </Button>
                <Button
                    onClick={handleSaveStep}
                    disabled={saving}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white min-w-[140px]"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                    {step === 6 ? 'Complete Setup' : 'Next Step'}
                    {!saving && step !== 6 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};