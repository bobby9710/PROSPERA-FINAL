import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, NOTIFICATION_ICONS, NOTIFICATION_COLORS, Notification } from "@/hooks/useNotifications";
import { Bell, CheckCheck, Trash2, Loader2, BellOff, ExternalLink } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const { 
    notifications, 
    loadingNotifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (loadingNotifications) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Acompanhe todas as atividades da sua conta
            </p>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => clearAll()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar todas
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Notificações</CardTitle>
            <CardDescription>
              {notifications.length === 0 
                ? "Você não tem notificações" 
                : `${notifications.length} notificação${notifications.length > 1 ? "ões" : ""}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  Quando houver atualizações importantes, você verá aqui.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                        notification.is_read ? "bg-background" : "bg-primary/5 border-primary/20"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${NOTIFICATION_COLORS[notification.type]}`}>
                          <span className="text-xl">{NOTIFICATION_ICONS[notification.type]}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className={`font-semibold ${!notification.is_read ? "text-primary" : ""}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            
                            {notification.action_url && notification.action_label && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                {notification.action_label}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Notification Types Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipos de Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(NOTIFICATION_ICONS).map(([type, icon]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS]}`}>
                    <span>{icon}</span>
                  </div>
                  <span className="text-sm capitalize">
                    {type === 'transaction' && 'Transação'}
                    {type === 'goal_achieved' && 'Meta Atingida'}
                    {type === 'bill_due' && 'Fatura a Vencer'}
                    {type === 'budget_exceeded' && 'Orçamento Estourado'}
                    {type === 'challenge_completed' && 'Desafio Completado'}
                    {type === 'monthly_analysis' && 'Análise Mensal'}
                    {type === 'system' && 'Sistema'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
