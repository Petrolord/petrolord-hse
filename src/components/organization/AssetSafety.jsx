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
        <p className="text-pl-muted">Loading safety data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pl-primary-text" aria-hidden="true" />
              Safety Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safetyData?.score != null ? (
              <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{safetyData.score}%</p>
            ) : (
              <p className="text-xl font-semibold text-pl-muted">No data yet</p>
            )}
            <p className="text-xs text-pl-muted mt-2">Share of assets marked safe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-pl-success-text" aria-hidden="true" />
              Safe Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-success-text">{safetyData?.safe || 0}</p>
            <p className="text-xs text-pl-muted mt-2">No issues detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-pl-warning-text" aria-hidden="true" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-warning-text">{safetyData?.warning || 0}</p>
            <p className="text-xs text-pl-muted mt-2">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-pl-danger-text" aria-hidden="true" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-danger-text">{safetyData?.critical || 0}</p>
            <p className="text-xs text-pl-muted mt-2">Immediate action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
          <CardDescription>Assets due for inspection or maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-pl-muted">No data yet. Asset records do not carry maintenance due dates.</p>
        </CardContent>
      </Card>

      {/* Flagged Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Assets Needing Attention</CardTitle>
          <CardDescription>Assets currently marked warning or critical</CardDescription>
        </CardHeader>
        <CardContent>
          {(safetyData?.flagged || []).length === 0 ? (
            <p className="text-sm text-pl-muted">No assets are flagged.</p>
          ) : (
            <div className="space-y-3 text-pl-text">
              {safetyData.flagged.map((item) => (
                <div key={item.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-pl-border bg-pl-sunken border-l-4 ${item.safety_status === 'critical' ? 'border-l-pl-danger' : 'border-l-pl-warning'}`}>
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    {item.safety_notes && <p className="text-sm text-pl-muted">{item.safety_notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {item.updated_at && <p className="text-sm text-pl-muted">{new Date(item.updated_at).toLocaleDateString()}</p>}
                    <Badge variant={item.safety_status === 'critical' ? 'danger' : 'warning'}>
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
