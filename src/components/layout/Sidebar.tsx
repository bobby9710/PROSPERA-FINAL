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
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta",
    });
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Meu Controle</h1>
            <span className="text-xs text-primary font-medium">IA</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn("nav-item", isActive && "active")}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.premium && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn("nav-item", isActive && "active")}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={handleSignOut}
          className="nav-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
