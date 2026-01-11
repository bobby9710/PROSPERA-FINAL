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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;

          if (item.isFab) {
            return (
              <Link key={item.href} to={item.href} className="fab-button">
                <item.icon className="w-6 h-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn("bottom-nav-item", isActive && "active")}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className={cn("text-xs", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button className={cn("bottom-nav-item", isMoreActive && "active")}>
              <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "text-primary")} />
              <span className={cn("text-xs", isMoreActive ? "text-primary font-medium" : "text-muted-foreground")}>
                Mais
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            className="w-48 p-2 mb-2 bg-card border shadow-lg"
            sideOffset={8}
          >
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
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
