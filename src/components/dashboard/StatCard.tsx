import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  type: "income" | "expense" | "balance";
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, type, delay = 0 }: StatCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const typeStyles = {
    income: {
      iconBg: "bg-success/10",
      iconColor: "text-success",
      valueColor: "text-success",
    },
    expense: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      valueColor: "text-destructive",
    },
    balance: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
    },
  };

  const styles = typeStyles[type];

  return (
    <div 
      className="stat-card animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn("text-xl font-bold truncate", styles.valueColor)}>
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </div>
  );
}
