import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { AssetForm } from './AssetForm';
import { ASSET_CATEGORIES, ASSET_TEMPLATES } from '@/constants/assetConstants';
import { fetchOrganizationAssets, addAsset, updateAsset, deleteAsset } from '@/services/organizationService';

export const OrganizationAssets = ({ organization, onUpdate }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  useEffect(() => {
    if(organization?.id) {
      loadAssets();
    }
  }, [organization?.id]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await fetchOrganizationAssets(organization.id);
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (assetData) => {
    try {
      await addAsset(organization.id, assetData);
      setShowForm(false);
      loadAssets();
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleUpdateAsset = async (assetData) => {
    try {
      const { id, ...updates } = assetData;
      await updateAsset(id, updates);
      setEditingAsset(null);
      loadAssets();
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset(assetToDelete);
      loadAssets();
      onUpdate && onUpdate();
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const openDeleteDialog = (assetId) => {
    setAssetToDelete(assetId);
    setDeleteDialogOpen(true);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.asset_id && asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSafetyColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-green-900 text-green-100 hover:bg-green-800';
      case 'warning':
        return 'bg-yellow-900 text-yellow-100 hover:bg-yellow-800';
      case 'critical':
        return 'bg-red-900 text-red-100 hover:bg-red-800';
      default:
        return 'bg-gray-700 text-gray-100 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Asset</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this asset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAsset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Asset Templates */}
      {!showForm && !editingAsset && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Add Assets</CardTitle>
            <CardDescription className="text-gray-400">Use templates to quickly add common assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ASSET_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => {
                    setEditingAsset(null);
                    setShowForm(template);
                  }}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 text-left justify-start text-white"
                >
                  <span className="text-lg mr-2">{template.icon}</span>
                  <span className="text-sm">{template.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Form */}
      {(showForm || editingAsset) && (
        <AssetForm
          template={showForm && typeof showForm === 'object' ? showForm : null}
          asset={editingAsset}
          onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
          onCancel={() => {
            setShowForm(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* Assets List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Organization Assets</CardTitle>
            <CardDescription className="text-gray-400">Manage equipment and resources</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingAsset(null);
              setShowForm(true);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="all">All Categories</option>
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assets Grid */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No assets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-yellow-500 transition text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{asset.name}</h3>
                      <p className="text-sm text-gray-400">ID: {asset.asset_id}</p>
                    </div>
                    <Badge className={getSafetyColor(asset.safety_status)}>
                      {asset.safety_status?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p><span className="text-gray-400">Category:</span> {asset.category}</p>
                    <p><span className="text-gray-400">Location:</span> {asset.location || 'N/A'}</p>
                    <p><span className="text-gray-400">Assigned to:</span> {asset.assigned_to || 'Unassigned'}</p>
                    {asset.last_inspection && (
                      <p><span className="text-gray-400">Last Inspection:</span> {new Date(asset.last_inspection).toLocaleDateString()}</p>
                    )}
                  </div>

                  {asset.safety_notes && (
                    <div className="mb-4 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-sm text-yellow-100 flex gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{asset.safety_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingAsset(asset);
                        setShowForm(false);
                      }}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(asset.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{assets.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {assets.filter(a => a.safety_status === 'safe').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">
              {assets.filter(a => a.safety_status === 'warning').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {assets.filter(a => a.safety_status === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};