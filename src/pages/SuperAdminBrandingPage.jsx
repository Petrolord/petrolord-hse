import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/admin/branding/OrganizationSelector';
import SuperAdminBrandingCustomizer from '@/components/admin/branding/SuperAdminBrandingCustomizer';
import { superAdminBrandingService } from '@/services/superAdminBrandingService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AccountScope } from '@/components/account/accountChrome';

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

  // /dashboard/super-admin/branding sits outside the signed-in layout, so it
  // opens its own design-system scope (AccountScope) with the light/dark
  // toggle in its header bar (docs/scope/DesignSystem-Rollout.md section
  // 4.2, batch 3A). Batch 4B hid the colour, typography and custom CSS
  // controls and the colour preview: those values no longer render anywhere.
  return (
    <AccountScope testId="branding-manager-theme-scope" className="h-screen flex flex-col text-pl-text">
      {/* Header */}
      <div className="h-14 border-b border-pl-border bg-pl-surface flex items-center gap-2 px-2 sm:px-4 shrink-0">
        <Button 
          variant="ghost" 
          className="gap-2 px-2 sm:px-4"
          onClick={() => navigate('/dashboard/super-admin')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sr-only sm:hidden">Back to Dashboard</span>
        </Button>
        <div className="h-6 w-px bg-pl-border mx-1 sm:mx-2" aria-hidden="true" />
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wider text-pl-text">Branding Manager</h1>
        <ThemeToggle />
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[60vh] md:h-full border-t md:border-t-0 md:border-l border-pl-border">
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
        </div>
      </div>
    </AccountScope>
  );
}
