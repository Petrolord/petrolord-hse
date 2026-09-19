import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { fetchAssetSafetyData } from '@/services/organizationService';

export const AssetSafety = ({ organization }) => {
  const [safetyData, setSafetyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(organization?.id) {
        loadSafetyData();
    }
  }, [organization?.id]);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      const data = await fetchAssetSafetyData(organization.id);
      setSafetyData(data);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading safety data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Safety Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safetyData?.score != null ? (
              <p className="text-3xl font-bold text-green-500">{safetyData.score}%</p>
            ) : (
              <p className="text-xl font-semibold text-gray-400">No data yet</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Share of assets marked safe</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Safe Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{safetyData?.safe || 0}</p>
            <p className="text-xs text-gray-400 mt-2">No issues detected</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{safetyData?.warning || 0}</p>
            <p className="text-xs text-gray-400 mt-2">Require attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{safetyData?.critical || 0}</p>
            <p className="text-xs text-gray-400 mt-2">Immediate action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Schedule */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Upcoming Maintenance</CardTitle>
          <CardDescription className="text-gray-400">Assets due for inspection or maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No data yet. Asset records do not carry maintenance due dates.</p>
        </CardContent>
      </Card>

      {/* Flagged Assets */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Assets Needing Attention</CardTitle>
          <CardDescription className="text-gray-400">Assets currently marked warning or critical</CardDescription>
        </CardHeader>
        <CardContent>
          {(safetyData?.flagged || []).length === 0 ? (
            <p className="text-sm text-gray-400">No assets are flagged.</p>
          ) : (
            <div className="space-y-3 text-white">
              {safetyData.flagged.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-3 bg-gray-700 rounded-lg border-l-4 ${item.safety_status === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.safety_notes && <p className="text-sm text-gray-400">{item.safety_notes}</p>}
                  </div>
                  <div className="text-right">
                    {item.updated_at && <p className="text-sm text-gray-400">{new Date(item.updated_at).toLocaleDateString()}</p>}
                    <Badge className={item.safety_status === 'critical' ? 'bg-red-900 text-red-100 hover:bg-red-800' : 'bg-yellow-900 text-yellow-100 hover:bg-yellow-800'}>
                      {item.safety_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};