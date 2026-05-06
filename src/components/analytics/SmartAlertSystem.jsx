import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clock, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHSE } from '@/context/HSEContext';
import { recommendationEngine } from '@/services/recommendationEngine';
import { supabase } from '@/lib/customSupabaseClient';

export default function SmartAlertSystem() {
  const { currentOrganization } = useHSE();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadAlerts();
      subscribeToAlerts();
    }
    return () => {
      supabase.removeAllChannels();
    };
  }, [currentOrganization?.id]);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await recommendationEngine.getAlerts(currentOrganization.id);
    setAlerts(data);
    setLoading(false);
  };

  const subscribeToAlerts = () => {
    supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `organization_id=eq.${currentOrganization.id}` }, 
        () => loadAlerts()
      )
      .subscribe();
  };

  const handleAcknowledge = async (id) => {
    await recommendationEngine.acknowledgeAlert(id);
    // Realtime will update list, but we can optimistically update too if needed
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'CRITICAL': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
      case 'HIGH': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50' };
      case 'MEDIUM': return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/50' };
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]"></div>;
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <div className="relative">
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        Smart Alerts ({alerts.length})
      </h3>
      
      <div className="grid gap-3">
        {alerts.map((alert) => {
          const style = getAlertStyle(alert.alert_type);
          const Icon = style.icon;
          
          return (
            <div key={alert.id} className={`relative overflow-hidden rounded-lg border ${style.border} ${style.bg} p-4 transition-all hover:bg-opacity-20`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full bg-black/20 ${style.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold ${style.color} text-lg`}>{alert.title}</h4>
                    <Badge variant="outline" className={`${style.color} border-current`}>{alert.alert_type}</Badge>
                  </div>
                  <p className="text-white/80 mt-1 text-sm">{alert.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2 items-center text-xs text-white/60 bg-black/20 p-2 rounded-md border border-white/5">
                    <span className="font-semibold text-white/90">Recommended Action:</span> 
                    {alert.recommended_action}
                    <span className="mx-2 text-white/20">|</span>
                    <span className="font-semibold text-white/90">Deadline:</span>
                    {new Date(alert.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button 
                    size="sm" 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  >
                    <Check className="h-4 w-4 mr-2" /> Acknowledge
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}