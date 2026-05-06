import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useHSE } from '@/context/HSEContext';
import { useToast } from '@/components/ui/use-toast';
import { notificationService } from '@/services/notificationService';
import { playNotificationSound } from '@/lib/notificationSound';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initial Fetch
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const [data, count] = await Promise.all([
        notificationService.getUserNotifications(currentUser.id),
        notificationService.getUnreadCount(currentUser.id)
      ]);
      setNotifications(data || []);
      setUnreadCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT and UPDATE
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Audio & Visual Alert
            playNotificationSound();
            toast({
              title: newNotif.title,
              description: newNotif.message,
              variant: newNotif.type === 'alert' ? "destructive" : "default",
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Handle updates (e.g., marked as read on another device)
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            );
            // Re-fetch count to ensure accuracy
            notificationService.getUnreadCount(currentUser.id).then(setUnreadCount);
          } else if (payload.eventType === 'DELETE') {
             setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
             // Re-fetch count
             notificationService.getUnreadCount(currentUser.id).then(setUnreadCount);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const markRead = async (id) => {
    // Optimistic update
    const target = notifications.find(n => n.id === id);
    if(target && !target.is_read) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await notificationService.markAsRead(id);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    if (currentUser) {
      await notificationService.markAllAsRead(currentUser.id);
    }
  };

  const deleteNotification = async (id) => {
    const notif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }
    await notificationService.deleteNotification(id);
  };

  return (
    <RealtimeContext.Provider value={{ 
      isConnected, 
      notifications, 
      unreadCount, 
      markRead, 
      markAllRead, 
      deleteNotification,
      refreshNotifications: fetchNotifications 
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};