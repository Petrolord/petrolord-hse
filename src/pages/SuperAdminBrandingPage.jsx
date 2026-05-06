import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/admin/branding/OrganizationSelector';
import SuperAdminBrandingCustomizer from '@/components/admin/branding/SuperAdminBrandingCustomizer';
import SuperAdminBrandingPreview from '@/components/admin/branding/SuperAdminBrandingPreview';
import { superAdminBrandingService } from '@/services/superAdminBrandingService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const DEFAULT_SETTINGS = {
  primary_color: '#FFC107',
  secondary_color: '#1F2937',
  accent_color: '#3B82F6',
  text_color: '#FFFFFF',
  background_color: '#111827',
  font_family: 'Inter',
  font_size_base: 16,
  border_radius: 'md',
  is_branding_enabled: false,
  logo_url: null,
  favicon_url: null
};

export default function SuperAdminBrandingPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentSettings, setCurrentSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    // When selection changes, try to load settings if single org is selected
    if (selectedIds.length === 1) {
      loadOrgSettings(selectedIds[0]);
    } else if (selectedIds.length > 1) {
      // Keep current settings or reset to partial? 
      // For now we keep what is there to allow "copying" settings to others
    } else {
      setCurrentSettings(DEFAULT_SETTINGS);
    }
  }, [selectedIds]);

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminBrandingService.getAllOrganizations();
      setOrganizations(data || []);
    } catch (e) {
      toast({ title: "Error", description: "Failed to load organizations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrgSettings = async (orgId) => {
    setIsLoading(true);
    try {
      const data = await superAdminBrandingService.getOrganizationBranding(orgId);
      if (data) {
        setCurrentSettings(data);
      } else {
        setCurrentSettings(DEFAULT_SETTINGS);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    
    setIsSaving(true);
    try {
      if (selectedIds.length === 1) {
        await superAdminBrandingService.updateOrganizationBranding(selectedIds[0], currentSettings);
      } else {
        await superAdminBrandingService.bulkUpdateBranding(selectedIds, currentSettings);
      }
      
      toast({ 
        title: "Success", 
        description: `Branding applied to ${selectedIds.length} organization(s).` 
      });
      fetchOrgs(); // Refresh list to update "branded" badges
    } catch (e) {
      toast({ title: "Save Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTemplate = (templateConfig) => {
    setCurrentSettings(prev => ({
      ...prev,
      ...templateConfig
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-[#111827]">
      {/* Header */}
      <div className="h-14 border-b border-[#3a3a5a] bg-[#1a1a2e] flex items-center px-4 shrink-0">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white hover:bg-[#252541] gap-2 mr-4"
          onClick={() => navigate('/dashboard/super-admin')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="h-6 w-px bg-[#3a3a5a] mr-4" />
        <h1 className="text-sm font-semibold text-white uppercase tracking-wider">Branding Manager</h1>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Org Selector */}
        <div className="w-full md:w-80 h-[40vh] md:h-full flex-shrink-0">
          <OrganizationSelector 
            organizations={organizations} 
            selectedIds={selectedIds} 
            onSelectionChange={setSelectedIds} 
          />
        </div>

        {/* Middle Panel: Customizer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[60vh] md:h-full border-l border-[#3a3a5a]">
          <div className="flex-1 h-full overflow-hidden">
            <SuperAdminBrandingCustomizer 
              settings={currentSettings} 
              setSettings={setCurrentSettings}
              onSave={handleSave}
              onApplyTemplate={handleApplyTemplate}
              isLoading={isSaving}
              selectedCount={selectedIds.length}
            />
          </div>

          {/* Right Panel: Preview (Hidden on small screens or toggleable) */}
          <div className="hidden lg:block w-[400px] border-l border-[#3a3a5a] bg-black">
            <SuperAdminBrandingPreview settings={currentSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}