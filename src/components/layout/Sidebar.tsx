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

  const navGroups = [
    {
      label: "Main",
      items: [
        { icon: "dashboard", label: "Dashboard", href: "/" },
        { icon: "smart_toy", label: "Assistente IA", href: "/assistant", highlight: true },
      ]
    },
    {
      label: "Operações",
      items: [
        { icon: "swap_horiz", label: "Movimentações", href: "/transactions" },
        { icon: "credit_card", label: "Cartões", href: "/cards" },
        { icon: "tour", label: "Metas", href: "/goals" },
        { icon: "document_scanner", label: "Scanner", href: "/scanner", premium: true },
        { icon: "account_tree", label: "Open Finance", href: "/open-finance", premium: true },
      ]
    },
    {
      label: "Análise",
      items: [
        { icon: "timeline", label: "Linha do Tempo", href: "/timeline" },
        { icon: "lightbulb", label: "Insights", href: "/insights", premium: true },
        { icon: "analytics", label: "Relatórios", href: "/reports", premium: true },
      ]
    },
    {
      label: "Crescimento",
      items: [
        { icon: "military_tech", label: "Desafios", href: "/challenges" },
        { icon: "calculate", label: "Simulador", href: "/simulator" },
        { icon: "robot_2", label: "Automações", href: "/automations", premium: true },
        { icon: "school", label: "Educação", href: "/education", premium: true },
      ]
    },
    {
      label: "Gerenciamento",
      items: [
        { icon: "person_pin_circle", label: "Perfil Financeiro", href: "/financial-profile" },
        { icon: "category", label: "Categorias", href: "/categories" },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-card-dark z-20 shrink-0 fixed left-0 top-0 h-screen">
      <div className="p-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white glow-primary">
          <span className="material-symbols-outlined text-lg font-bold">account_balance_wallet</span>
        </div>
        <Link to="/">
          <h1 className="text-base font-bold tracking-tight text-primary leading-tight">Prospera</h1>
          <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Finanças Inteligentes</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-4 overflow-y-auto sidebar-scroll pb-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label !== "Main" && (
              <div className="px-3 mb-1 text-[8px] font-bold uppercase text-slate-400 tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item, iIdx) => {
                const isActive = location.pathname === item.href;
                
                if (item.premium) {
                  return (
                    <Link
                      key={iIdx}
                      to={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-1 rounded-lg text-slate-500 transition-colors group",
                        isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        <span className="text-[12px]">{item.label}</span>
                      </div>
                      <span className="text-[8px] bg-primary/20 text-primary px-1 py-0.5 rounded font-bold">PRO</span>
                    </Link>
                  );
                }

                if (isActive && group.label === "Main") {
                  return (
                    <Link
                      key={iIdx}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      <span className="text-[12px]">{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={iIdx}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-lg text-slate-500 transition-colors",
                      isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className={cn(
                      "material-symbols-outlined text-lg",
                      item.highlight ? "text-primary" : ""
                    )}>{item.icon}</span>
                    <span className={cn(
                      "text-[12px]",
                      item.highlight ? "font-medium" : ""
                    )}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pin Section (Bottom) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-card-dark/50 backdrop-blur-sm">
        <div className="space-y-1 mb-2">
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="text-[12px]">Configurações</span>
          </Link>
          <Link 
            to="/help" 
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">help</span>
            <span className="text-[12px]">Central de Ajuda</span>
          </Link>
          <Link 
            to="/premium" 
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span className="text-[12px]">Plano Premium</span>
          </Link>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-[12px] font-bold">Sair</span>
        </button>
      </div>
    </aside>
  );
}
