import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { updateOrganization } from '@/services/organizationService';

export const OrganizationInfo = ({ organization, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    industry: organization?.industry || '',
    location: organization?.location || '',
    website: organization?.website || '',
    phone: organization?.phone || '',
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
    if (!organization?.id) return;
    
    try {
      setLoading(true);
      await updateOrganization(organization.id, formData);
      setMessage({ type: 'success', text: 'Organization updated successfully!' });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Overview</CardTitle>
          <CardDescription className="mt-1.5">Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-pl-text">
                <div>
                  <p className="text-sm text-pl-muted">Organization Name</p>
                  <p className="text-lg font-semibold">{organization?.name || 'n/a'}</p>
                </div>
                <div>
                  <p className="text-sm text-pl-muted">Industry</p>
                  <p className="text-lg font-semibold">{organization?.industry || 'n/a'}</p>
                </div>
                <div>
                  <p className="text-sm text-pl-muted">Location</p>
                  <p className="text-lg font-semibold">{organization?.location || 'n/a'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-pl-muted">Website</p>
                  <p className="text-lg font-semibold break-all">{organization?.website || 'n/a'}</p>
                </div>
              </div>
              <div className="text-pl-text">
                <p className="text-sm text-pl-muted">Description</p>
                <p>{organization?.description || 'No description'}</p>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                Edit Organization
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-pl-text">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    type="url"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Safety Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{organization?.asset_count || 0}</p>
            <p className="text-xs text-pl-muted mt-2">Equipment and resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{organization?.member_count || 0}</p>
            <p className="text-xs text-pl-muted mt-2">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            {organization?.safety_score != null ? (
              <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{organization.safety_score}%</p>
            ) : (
              <p className="text-xl font-semibold text-pl-muted">No data yet</p>
            )}
            <p className="text-xs text-pl-muted mt-2">Overall safety rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
