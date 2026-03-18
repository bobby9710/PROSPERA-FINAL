import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileMenu } from "./MobileMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
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
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Meu Controle</span>
            </Link>
          </div>
          <NotificationBell />
        </header>
      )}
      
      <main className={`${isMobile ? 'pt-16 pb-24' : 'lg:pl-64 focus-visible:outline-none focus:outline-none transition-all duration-300'} min-h-screen relative`}>
        {/* Background ambient light effects for premium look */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-40 dark:opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/15 blur-[100px]" />
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {isMobile && <BottomNav />}
    </div>
  );
}
