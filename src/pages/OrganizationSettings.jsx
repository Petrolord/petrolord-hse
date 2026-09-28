import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Package, AlertCircle, Loader2 } from 'lucide-react';
import { OrganizationInfo } from '@/components/organization/OrganizationInfo';
import { OrganizationMembers } from '@/components/organization/OrganizationMembers';
import { OrganizationAssets } from '@/components/organization/OrganizationAssets';
import { AssetSafety } from '@/components/organization/AssetSafety';
import { useHSE } from '@/context/HSEContext';
import { fetchOrganization } from '@/services/organizationService';
import { Button } from '@/components/ui/button';
import { AccountScope, AccountPage, AccountHeader } from '@/components/account/accountChrome';

const OrganizationSettings = () => {
  const { currentOrganization, isLoading: contextLoading } = useHSE();
  const [activeTab, setActiveTab] = useState('info');
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only load if we have an ID
    if (currentOrganization?.id) {
        loadOrganizationData();
    } else if (!contextLoading) {
        // If context is done loading but no organization, stop local loading
        setLoading(false);
    }
  }, [currentOrganization, contextLoading]);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("⚙️ [OrgSettings] Fetching data for org:", currentOrganization.id);
      const data = await fetchOrganization(currentOrganization.id);
      setOrganization(data);
    } catch (error) {
      console.error('❌ [OrgSettings] Error loading organization:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // /organization sits outside the signed-in layout, so it opens its own
  // design-system scope (AccountScope) with the light/dark toggle in its
  // header (docs/scope/DesignSystem-Rollout.md section 4.2).
  if (contextLoading || loading) {
    return (
      <AccountScope testId="organization-settings-theme-scope" className="flex flex-col items-center justify-center text-pl-muted">
        <Loader2 className="h-12 w-12 animate-spin text-pl-primary-text mb-4" aria-hidden="true" />
        <p>Loading organization settings...</p>
      </AccountScope>
    );
  }

  if (error) {
    return (
      <AccountScope testId="organization-settings-theme-scope" className="flex flex-col items-center justify-center p-4 text-pl-text">
        <div className="rounded-lg border border-pl-danger/40 bg-pl-surface shadow-pl-sm p-6 max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-pl-danger-text mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Settings</h2>
            <p className="text-pl-muted mb-6">{error}</p>
            <Button onClick={loadOrganizationData}>Retry</Button>
        </div>
      </AccountScope>
    );
  }

  if (!organization && !contextLoading) {
    return (
      <AccountScope testId="organization-settings-theme-scope" className="flex flex-col items-center justify-center p-4 text-pl-text">
        <div className="text-center max-w-md">
            <Settings className="h-16 w-16 text-pl-border-strong mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold mb-2">No Organization Found</h2>
            <p className="text-pl-muted">Please ensure you are logged in and associated with an organization.</p>
        </div>
      </AccountScope>
    );
  }

  return (
    <AccountScope testId="organization-settings-theme-scope" className="text-pl-text">
      <AccountPage>
        <AccountHeader
          eyebrow="Organization"
          backTo="/dashboard"
          backLabel="Back to dashboard"
          icon={Settings}
          title="Organization Settings"
          description="Manage your organization, team, and assets"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="flex items-center gap-2" aria-label="Organization">
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2" aria-label="Members">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2" aria-label="Assets">
              <Package className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2" aria-label="Safety">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Safety</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Info Tab */}
          <TabsContent value="info" className="mt-6">
            <OrganizationInfo organization={organization} onUpdate={loadOrganizationData} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <OrganizationMembers organization={organization} onUpdate={loadOrganizationData} />
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
            <OrganizationAssets organization={organization} onUpdate={loadOrganizationData} />
          </TabsContent>

          {/* Asset Safety Tab */}
          <TabsContent value="safety" className="mt-6">
            <AssetSafety organization={organization} />
          </TabsContent>
        </Tabs>
      </AccountPage>
    </AccountScope>
  );
};

export default OrganizationSettings;