import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileMenu } from "./MobileMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Usuário';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex overflow-hidden">
      {!isMobile && <Sidebar />}
      
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-card/60 backdrop-blur-xl border-b border-border/40 z-50 flex items-center justify-between px-6 pt-safe">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Prospera</span>
            </Link>
          </div>
          <NotificationBell />
        </header>
      )}
      
      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-background-dark transition-all duration-300",
        !isMobile && "lg:pl-64"
      )}>
        {!isMobile && (
          <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold dark:text-slate-100">Olá, {user?.user_metadata?.full_name || firstName}</h2>
              <span className="text-slate-400 text-sm hidden md:block">Bem-vindo de volta!</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input 
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 text-slate-100 placeholder:text-slate-500" 
                  placeholder="Buscar transação..." 
                  type="text"
                />
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-400 p-0.5">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      firstName[0].toUpperCase()
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>

      {isMobile && <BottomNav />}
    </div>
  );
}
