import { supabase } from '@/lib/customSupabaseClient';

export const notificationService = {
  /**
   * Fetch notifications for a user
   */
  async getUserNotifications(userId) {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Create a notification
   */
  async createNotification({
    userId,
    organizationId,
    title,
    message,
    type = 'info',
    link = null,
    reportId = null,
    reportType = null,
    createdBy = null
  }) {
    const { data, error } = await supabase
      .from('user_notifications')
      .insert([{
        user_id: userId,
        organization_id: organizationId,
        title,
        message,
        type,
        link,
        report_id: reportId,
        report_type: reportType,
        created_by: createdBy,
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      // Don't throw, just log, so we don't break the main flow
      return null;
    }
    return data;
  },

  /**
   * Send Email Notification (Calls Edge Function)
   */
  async sendEmailNotification(to, subject, html) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to send email:", err);
      // We don't throw here to avoid blocking UI
      return null;
    }
  },

  /**
   * Get User Notification Preferences
   */
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notifications')
        .eq('user_id', userId)
        .single();
      
      if (error) return { email: true, in_app: true }; // Default to true on error/missing
      
      // Assume structure: { quick_report: { email: true, in_app: true } }
      // Or simple flat structure. Defaulting to true if not set.
      const prefs = data?.notifications || {};
      return {
        email: prefs.email_on_quick_report !== false,
        in_app: prefs.in_app_on_quick_report !== false
      };
    } catch (e) {
      return { email: true, in_app: true };
    }
  }
};