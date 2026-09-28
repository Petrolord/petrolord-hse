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
import { accountNativeSelect } from '@/components/account/accountChrome';
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

  // Safety status is the one place colour carries meaning here, and the
  // badge always shows the word.
  const safetyVariant = (status) => {
    switch (status) {
      case 'safe':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAsset}
              className="bg-pl-danger text-pl-danger-fg hover:bg-pl-danger/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Asset Templates */}
      {!showForm && !editingAsset && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Assets</CardTitle>
            <CardDescription>Use templates to quickly add common assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {ASSET_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => {
                    setEditingAsset(null);
                    setShowForm(template);
                  }}
                  variant="outline"
                  className="text-left justify-start min-w-0"
                >
                  <span className="text-lg mr-2" aria-hidden="true">{template.icon}</span>
                  <span className="text-sm truncate">{template.name}</span>
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
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Organization Assets</CardTitle>
            <CardDescription className="mt-1.5">Manage equipment and resources</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingAsset(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 self-start sm:self-auto"
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
                aria-label="Search assets"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Category"
                className={`${accountNativeSelect} md:w-56`}
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
              <p className="text-pl-muted">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-pl-border-strong mx-auto mb-4" aria-hidden="true" />
              <p className="text-pl-muted">No assets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-lg border border-pl-border bg-pl-sunken hover:border-pl-primary/50 transition-colors text-pl-text">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg">{asset.name}</h3>
                      <p className="text-sm text-pl-muted">ID: <span className="font-pl-mono">{asset.asset_id}</span></p>
                    </div>
                    <Badge variant={safetyVariant(asset.safety_status)} className="shrink-0">
                      {asset.safety_status?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p><span className="text-pl-muted">Category:</span> {asset.category}</p>
                    <p><span className="text-pl-muted">Location:</span> {asset.location || 'n/a'}</p>
                    <p><span className="text-pl-muted">Assigned to:</span> {asset.assigned_to || 'Unassigned'}</p>
                    {asset.last_inspection && (
                      <p><span className="text-pl-muted">Last Inspection:</span> {new Date(asset.last_inspection).toLocaleDateString()}</p>
                    )}
                  </div>

                  {asset.safety_notes && (
                    <div className="mb-4 p-2 rounded border border-pl-warning/40 bg-pl-warning-bg text-sm text-pl-warning-text flex gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
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
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(asset.id)}
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${asset.name}`}
                      title="Delete"
                      className="text-pl-danger-text hover:bg-pl-danger-bg hover:text-pl-danger-text"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">
              {assets.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-success-text">
              {assets.filter(a => a.safety_status === 'safe').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-warning-text">
              {assets.filter(a => a.safety_status === 'warning').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-danger-text">
              {assets.filter(a => a.safety_status === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
