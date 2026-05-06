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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Organization Overview</CardTitle>
          <CardDescription className="text-gray-400">Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <p className="text-sm text-gray-400">Organization Name</p>
                  <p className="text-lg font-semibold">{organization?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Industry</p>
                  <p className="text-lg font-semibold">{organization?.industry || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-lg font-semibold">{organization?.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="text-lg font-semibold">{organization?.website || 'N/A'}</p>
                </div>
              </div>
              <div className="text-white">
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-gray-300">{organization?.description || 'No description'}</p>
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Edit Organization
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-900 text-green-100' 
                    : 'bg-red-900 text-red-100'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
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
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
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
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
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
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{organization?.asset_count || 0}</p>
            <p className="text-xs text-gray-400 mt-2">Equipment and resources</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{organization?.member_count || 0}</p>
            <p className="text-xs text-gray-400 mt-2">Active users</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{organization?.safety_score || 0}%</p>
            <p className="text-xs text-gray-400 mt-2">Overall safety rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};