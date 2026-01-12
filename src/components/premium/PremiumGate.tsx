import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsPremium } from "@/hooks/useSubscription";

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showPreview?: boolean;
}

export function PremiumGate({ children, feature, showPreview = false }: PremiumGateProps) {
  const isPremium = useIsPremium();

  if (isPremium) {
    return <>{children}</>;
  }

  if (showPreview) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Card className="max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Recurso Premium</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {feature
                    ? `${feature} está disponível apenas para assinantes Premium`
                    : "Este recurso está disponível apenas para assinantes Premium"}
                </p>
              </div>
              <Link to="/premium">
                <Button className="w-full gap-2">
                  <Crown className="w-4 h-4" />
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Recurso Bloqueado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {feature
              ? `${feature} está disponível apenas para assinantes Premium`
              : "Este recurso está disponível apenas para assinantes Premium"}
          </p>
        </div>
        <Link to="/premium">
          <Button className="gap-2">
            <Crown className="w-4 h-4" />
            Desbloquear com Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
