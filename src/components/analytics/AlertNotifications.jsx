import React, { useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useHSE } from '@/context/HSEContext';

// This component is purely logic for triggering Toasts on new alerts
// It should be mounted near the top of the app tree (e.g. in DashboardRouter or MainContent)
export default function AlertNotifications() {
  const { toast } = useToast();
  const { currentOrganization } = useHSE();

  useEffect(() => {
    if (!currentOrganization?.id) return;

    const channel = supabase
      .channel('global-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        (payload) => {
          const alert = payload.new;
          if (alert.alert_type === 'CRITICAL' || alert.alert_type === 'HIGH') {
            toast({
              variant: "destructive",
              title: `🚨 ${alert.alert_type} ALERT: ${alert.title}`,
              description: alert.description,
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrganization?.id, toast]);

  return null; // Renderless component
}