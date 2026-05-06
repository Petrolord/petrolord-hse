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
            <p className="text-3xl font-bold text-green-500">{safetyData?.score || 0}%</p>
            <p className="text-xs text-gray-400 mt-2">Overall safety rating</p>
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
          <div className="space-y-3 text-white">
            {[
              { asset: 'Forklift #1', dueDate: '2025-12-28', type: 'Inspection' },
              { asset: 'Safety Harness Set', dueDate: '2025-12-30', type: 'Certification' },
              { asset: 'Fire Extinguisher A', dueDate: '2026-01-05', type: 'Refill' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{item.asset}</p>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(item.dueDate).toLocaleDateString()}</p>
                  <Badge className="bg-yellow-900 text-yellow-100 mt-1 hover:bg-yellow-800">Due Soon</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Incidents */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Safety Incidents</CardTitle>
          <CardDescription className="text-gray-400">Incidents involving assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-white">
            {[
              { asset: 'Ladder #3', incident: 'Missing safety label', date: '2025-12-20', severity: 'warning' },
              { asset: 'PPE Kit #2', incident: 'Expired certification', date: '2025-12-18', severity: 'critical' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border-l-4 border-yellow-500">
                <div>
                  <p className="font-medium">{item.asset}</p>
                  <p className="text-sm text-gray-400">{item.incident}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                  <Badge className={item.severity === 'critical' ? 'bg-red-900 text-red-100 hover:bg-red-800' : 'bg-yellow-900 text-yellow-100 hover:bg-yellow-800'}>
                    {item.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};