import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  user_id: string;
  type: 'transaction' | 'goal_achieved' | 'bill_due' | 'budget_exceeded' | 'challenge_completed' | 'monthly_analysis' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const NOTIFICATION_ICONS: Record<Notification['type'], string> = {
  transaction: '💸',
  goal_achieved: '🎯',
  bill_due: '📅',
  budget_exceeded: '⚠️',
  challenge_completed: '🏆',
  monthly_analysis: '📊',
  system: '🔔',
};

export const NOTIFICATION_COLORS: Record<Notification['type'], string> = {
  transaction: 'bg-blue-500/10 text-blue-500',
  goal_achieved: 'bg-green-500/10 text-green-500',
  bill_due: 'bg-orange-500/10 text-orange-500',
  budget_exceeded: 'bg-red-500/10 text-red-500',
  challenge_completed: 'bg-purple-500/10 text-purple-500',
  monthly_analysis: 'bg-cyan-500/10 text-cyan-500',
  system: 'bg-gray-500/10 text-gray-500',
};

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: loadingNotifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("notifications")
        .insert([{
          user_id: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action_url: notification.action_url,
          action_label: notification.action_label,
          metadata: notification.metadata ? JSON.parse(JSON.stringify(notification.metadata)) : {},
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Notificações marcadas como lidas",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Notificação removida",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Todas as notificações foram removidas",
      });
    },
  });

  return {
    notifications,
    loadingNotifications,
    unreadCount,
    createNotification: createNotificationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
  };
}
