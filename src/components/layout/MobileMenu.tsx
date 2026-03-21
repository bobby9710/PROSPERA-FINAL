import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "Principal",
    items: [
      { icon: "dashboard", label: "Dashboard", href: "/" },
      { icon: "swap_horiz", label: "Transações", href: "/transactions" },
      { icon: "timeline", label: "Linha do Tempo", href: "/timeline" },
    ],
  },
  {
    title: "Operações",
    items: [
      { icon: "credit_card", label: "Cartões", href: "/cards" },
      { icon: "category", label: "Categorias", href: "/categories" },
    ],
  },
  {
    title: "Análise",
    items: [
      { icon: "psychology", label: "Assistente IA", href: "/assistant" },
      { icon: "monitoring", label: "Insights", href: "/insights", premium: true },
      { icon: "article", label: "Relatórios", href: "/reports", premium: true },
    ],
  },
  {
    title: "Crescimento",
    items: [
      { icon: "target", label: "Metas", href: "/goals" },
      { icon: "emoji_events", label: "Desafios", href: "/challenges" },
      { icon: "school", label: "Educação", href: "/education", premium: true },
    ],
  },
  {
    title: "Gerenciamento",
    items: [
      { icon: "account_balance", label: "Open Finance", href: "/open-finance", premium: true },
      { icon: "settings_suggest", label: "Automações", href: "/automations", premium: true },
      { icon: "calculate", label: "Simulador", href: "/simulator" },
    ],
  },
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
          <span className="material-symbols-outlined">menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-[#07090f] border-slate-800 text-white">
        <SheetHeader className="p-6 border-b border-slate-800">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <span className="material-symbols-outlined text-white">bolt</span>
            </div>
            <div className="flex flex-col text-left">
              <h1 className="font-extrabold text-2xl tracking-tighter text-white">
                Pros<span className="text-primary">pera</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finanças Inteligentes</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)] px-4 py-6 sidebar-scroll">
          <div className="space-y-8">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-primary/10 text-primary font-bold shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className={cn(
                          "material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110",
                          isActive ? "text-primary" : "text-slate-500"
                        )}>
                          {item.icon}
                        </span>
                        <span className="text-sm">{item.label}</span>
                        {item.premium && (
                          <div className="ml-auto px-1.5 py-0.5 rounded-md bg-gradient-to-r from-primary to-purple-600 text-[8px] font-black text-white">
                            PRO
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-[#07090f]/80 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              Config
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Sair
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
