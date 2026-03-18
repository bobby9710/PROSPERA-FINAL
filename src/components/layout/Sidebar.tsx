import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowUpDown,
  Target,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Bell,
  Settings,
  Sparkles,
  LogOut,
  Tag,
  Building2,
  BarChart3,
  Calculator,
  Camera,
  Clock,
  Trophy,
  FileText,
  Zap,
  BookOpen,
  User,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ArrowUpDown, label: "Transações", href: "/transactions" },
  { icon: Clock, label: "Linha do Tempo", href: "/timeline" },
  { icon: Target, label: "Metas", href: "/goals" },
  { icon: Trophy, label: "Desafios", href: "/challenges" },
  { icon: CreditCard, label: "Cartões", href: "/cards" },
  { icon: Tag, label: "Categorias", href: "/categories" },
  { icon: MessageSquare, label: "Assistente IA", href: "/assistant" },
  { icon: Calculator, label: "Simulador", href: "/simulator" },
  { icon: Camera, label: "Scanner", href: "/scanner", premium: true },
  { icon: Building2, label: "Open Finance", href: "/open-finance", premium: true },
  { icon: BarChart3, label: "Insights", href: "/insights", premium: true },
  { icon: FileText, label: "Relatórios", href: "/reports", premium: true },
  { icon: Zap, label: "Automações", href: "/automations", premium: true },
  { icon: BookOpen, label: "Educação", href: "/education", premium: true },
  { icon: User, label: "Perfil Financeiro", href: "/financial-profile" },
];

const bottomNavItems = [
  { icon: Bell, label: "Notificações", href: "/notifications" },
  { icon: Settings, label: "Configurações", href: "/settings" },
  { icon: Crown, label: "Premium", href: "/premium", premium: true },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta",
    });
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card/60 backdrop-blur-3xl border-r border-border/40 z-50 flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-8 pb-6 border-transparent">
        <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-xl shadow-primary/25 border border-white/20 dark:border-white/10">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-2xl leading-tight tracking-tight text-foreground -mb-1">
              Pros<span className="text-primary">pera</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80 pl-0.5">
              Organize suas contas
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 scrollbar-hide custom-scrollbar">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary/70 group-hover:text-primary")} />
              <span className="font-semibold text-[15px]">{item.label}</span>
              {item.premium && (
                <span className={cn(
                  "ml-auto text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider",
                  isActive ? "bg-white/20 text-white" : "bg-secondary/10 text-secondary"
                )}>
                  PRO
                </span>
              )}
              {isActive && (
                <div className="absolute left-[-1rem] w-1.5 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Bottom Section */}
      <div className="p-6 mt-auto border-t border-border/40 bg-accent/20">
        <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate text-foreground">{user?.email?.split('@')[0]}</span>
            <span className="text-xs text-muted-foreground truncate opacity-70">Grátis</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-muted-foreground hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                  item.premium && "bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/10"
                )}
              >
                <item.icon className={cn("w-5 h-5", item.premium ? "text-yellow-500" : "text-primary/60")} />
                <span className="font-semibold text-sm">{item.label}</span>
                {item.premium && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-destructive/80 hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            <span className="font-semibold text-sm">Sair da conta</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
