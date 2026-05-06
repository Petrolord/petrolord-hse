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

  if (contextLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-400">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
        <p>Loading organization settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-gray-800 border border-red-700 rounded-lg p-6 max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Settings</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={loadOrganizationData} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
        </div>
      </div>
    );
  }

  if (!organization && !contextLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center max-w-md">
            <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Organization Found</h2>
            <p className="text-gray-400">Please ensure you are logged in and associated with an organization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">⚙️ Organization Settings</h1>
          <p className="text-gray-400">Manage your organization, team, and assets</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
            <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <AlertCircle className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default OrganizationSettings;