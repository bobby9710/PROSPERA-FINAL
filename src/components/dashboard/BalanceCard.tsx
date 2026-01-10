import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  percentChange: number;
}

export function BalanceCard({ balance, percentChange }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="card-primary rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-primary-foreground/80 font-medium">Saldo Total</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          {isVisible ? (
            <Eye className="w-5 h-5 text-primary-foreground/80" />
          ) : (
            <EyeOff className="w-5 h-5 text-primary-foreground/80" />
          )}
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
          {isVisible ? formatCurrency(balance) : "R$ ••••••"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
          percentChange >= 0 
            ? "bg-white/20 text-primary-foreground" 
            : "bg-destructive/30 text-primary-foreground"
        )}>
          <TrendingUp className={cn("w-4 h-4", percentChange < 0 && "rotate-180")} />
          <span>{percentChange >= 0 ? "+" : ""}{percentChange}%</span>
        </div>
        <span className="text-primary-foreground/70 text-sm">vs mês anterior</span>
      </div>
    </div>
  );
}
