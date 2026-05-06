import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHSE } from '@/context/HSEContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Badge } from "@/components/ui/badge";

export default function NotificationCenter() {
  const { currentUser } = useHSE();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('public:user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking read:", e);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(open) markAsRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-[#1e1e30] border-[#2a2a40] text-white" align="end">
        <div className="p-4 border-b border-[#2a2a40] flex justify-between items-center">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount} New</Badge>}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No notifications yet</div>
          ) : (
            <div className="divide-y divide-[#2a2a40]">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-4 hover:bg-[#25253e] transition-colors ${!notif.is_read ? 'bg-[#25253e]/50' : ''}`}>
                  <h5 className="text-sm font-medium text-white mb-1">{notif.title}</h5>
                  <p className="text-xs text-gray-400">{notif.message}</p>
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}