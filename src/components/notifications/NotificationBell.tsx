import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, NOTIFICATION_ICONS, NOTIFICATION_COLORS, Notification } from "@/hooks/useNotifications";
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react";

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificações</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar como lidas
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${NOTIFICATION_COLORS[notification.type]}`}>
                      <span className="text-sm">{NOTIFICATION_ICONS[notification.type]}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-sm font-medium truncate ${!notification.is_read ? "text-primary" : ""}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full text-sm" 
            onClick={() => {
              navigate("/notifications");
              setOpen(false);
            }}
          >
            Ver todas as notificações
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
