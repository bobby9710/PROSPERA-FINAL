import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Crown,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    icon: User,
    label: "Dados Pessoais",
    description: "Nome, email, telefone",
    href: "/profile/personal",
  },
  {
    icon: Shield,
    label: "Segurança",
    description: "Senha, autenticação",
    href: "/profile/security",
  },
  {
    icon: Bell,
    label: "Notificações",
    description: "Preferências de alertas",
    href: "/profile/notifications",
  },
  {
    icon: CreditCard,
    label: "Assinatura",
    description: "Gerenciar plano",
    href: "/profile/subscription",
    badge: "Premium",
  },
  {
    icon: Settings,
    label: "Configurações",
    description: "Preferências do app",
    href: "/settings",
  },
  {
    icon: HelpCircle,
    label: "Ajuda",
    description: "FAQ e suporte",
    href: "/help",
  },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta",
    });
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <AppLayout>
      {/* Profile Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary">
            <span className="text-3xl font-bold text-primary-foreground">
              {getInitials(user?.user_metadata?.full_name, user?.email)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center border-4 border-background">
            <Crown className="w-4 h-4 text-success-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{displayName}</h1>
        <p className="text-muted-foreground">{user?.email}</p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Plano Premium</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">Transações</p>
        </div>
        <div className="stat-card text-center animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-2xl font-bold text-success">0</p>
          <p className="text-sm text-muted-foreground">Metas Ativas</p>
        </div>
        <div className="stat-card text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-2xl font-bold text-secondary">0</p>
          <p className="text-sm text-muted-foreground">Cartões</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '250ms' }}>
        {menuItems.map((item) => (
          <button
            key={item.href}
            className="flex items-center gap-4 w-full p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.label}</p>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary text-[10px] font-semibold text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full mt-6 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sair da Conta
      </Button>

      {/* Version */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Meu Controle IA v1.0.0
      </p>
    </AppLayout>
  );
}
