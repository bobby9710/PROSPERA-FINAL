import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  ArrowUpDown,
  Target,
  CreditCard,
  MessageSquare,
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
  Bell,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

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
  { icon: Settings, label: "Configurações", href: "/profile" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-card">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-lg">Meu Controle</h1>
              <span className="text-xs text-primary font-medium">IA</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.premium && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-card space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
