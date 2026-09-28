import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ASSET_CATEGORIES } from '@/constants/assetConstants';
import { accountNativeSelect } from '@/components/account/accountChrome';

export const AssetForm = ({ template, asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: asset?.name || template?.name || '',
    asset_id: asset?.asset_id || template?.asset_id || '',
    category: asset?.category || template?.category || '',
    description: asset?.description || template?.description || '',
    location: asset?.location || '',
    assigned_to: asset?.assigned_to || '',
    purchase_date: asset?.purchase_date || '',
    warranty_expiry: asset?.warranty_expiry || '',
    safety_status: asset?.safety_status || 'safe',
    safety_notes: asset?.safety_notes || '',
    maintenance_schedule: asset?.maintenance_schedule || 'monthly',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (asset && asset.id) {
          // If editing, pass the ID along with data or handle it in parent
          await onSubmit({ ...formData, id: asset.id });
      } else {
          await onSubmit(formData);
      }
      setMessage({ type: 'success', text: 'Asset saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
        <CardDescription className="mt-1.5">
          {asset ? 'Update asset information' : 'Add a new asset to your organization'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 text-pl-text">
          {message && (
            <div role="status" className={`p-4 rounded-lg border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'border-pl-success/40 bg-pl-success-bg text-pl-success-text' 
                : 'border-pl-danger/40 bg-pl-danger-bg text-pl-danger-text'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              {message.text}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pl-text">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asset Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Asset ID *</label>
                <Input
                  name="asset_id"
                  value={formData.asset_id}
                  onChange={handleChange}
                  placeholder="e.g., ASSET-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={accountNativeSelect}
                  required
                >
                  <option value="">Select Category</option>
                  {ASSET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Building A, Floor 2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Assignment & Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pl-text">Assignment & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assigned To</label>
                <Input
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  placeholder="Team member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date</label>
                <Input
                  name="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Warranty Expiry</label>
                <Input
                  name="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Safety Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pl-text">Safety Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Safety Status</label>
                <select
                  name="safety_status"
                  value={formData.safety_status}
                  onChange={handleChange}
                  className={accountNativeSelect}
                >
                  <option value="safe">Safe</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Schedule</label>
                <select
                  name="maintenance_schedule"
                  value={formData.maintenance_schedule}
                  onChange={handleChange}
                  className={accountNativeSelect}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Safety Notes</label>
              <Textarea
                name="safety_notes"
                value={formData.safety_notes}
                onChange={handleChange}
                placeholder="Any safety concerns or maintenance notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t border-pl-border">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : asset ? 'Update Asset' : 'Add Asset'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};