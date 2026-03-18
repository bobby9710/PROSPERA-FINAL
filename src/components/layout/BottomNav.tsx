import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowUpDown,
  Plus,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Trophy,
  FileText,
  BarChart3,
  MessageSquare,
  User,
} from "lucide-react";
import { useState } from "react";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Início", href: "/" },
  { icon: ArrowUpDown, label: "Transações", href: "/transactions" },
  { icon: Plus, label: "Adicionar", href: "/add", isFab: true },
  { icon: Target, label: "Metas", href: "/goals" },
];

const moreItems = [
  { icon: Trophy, label: "Desafios", href: "/challenges" },
  { icon: FileText, label: "Relatórios", href: "/reports" },
  { icon: BarChart3, label: "Insights", href: "/insights" },
  { icon: MessageSquare, label: "Assistente", href: "/assistant" },
  { icon: User, label: "Perfil", href: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreItems.some(item => location.pathname === item.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/60 backdrop-blur-2xl border-t border-border/40 z-50 px-4 pb-safe pt-2">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto relative">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;

          if (item.isFab) {
            return (
              <div key={item.href} className="relative -top-6 flex flex-col items-center">
                <Link 
                  to={item.href} 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 ring-4 ring-background transition-transform active:scale-90"
                >
                  <item.icon className="w-8 h-8" />
                </Link>
                <span className="text-[10px] font-bold mt-2 text-primary">Novo</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground opacity-60"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("text-[10px] font-bold tracking-wide uppercase")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-300",
              isMoreActive ? "text-primary" : "text-muted-foreground opacity-60"
            )}>
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isMoreActive && "bg-primary/10"
              )}>
                <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("text-[10px] font-bold tracking-wide uppercase")}>
                Mais
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            className="w-56 p-2 mb-4 bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl"
            sideOffset={12}
          >
            <div className="grid grid-cols-1 gap-1">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-foreground hover:bg-accent/80"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-primary/70")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
