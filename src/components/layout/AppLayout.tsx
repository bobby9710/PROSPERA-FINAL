import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}
      
      <main className={`${isMobile ? 'pb-24' : 'lg:pl-64'} min-h-screen`}>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {isMobile && <BottomNav />}
    </div>
  );
}
