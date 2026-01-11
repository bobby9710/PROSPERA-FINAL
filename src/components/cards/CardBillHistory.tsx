import { CheckCircle2, XCircle, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CreditCard } from "@/hooks/useCreditCards";

interface BillHistoryItem {
  month: string;
  year: number;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

interface CardBillHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CreditCard;
  history: BillHistoryItem[];
}

export function CardBillHistory({ open, onOpenChange, card, history }: CardBillHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "overdue":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Calendar className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paga";
      case "overdue":
        return "Vencida";
      default:
        return "Pendente";
    }
  };

  // Calculate totals
  const totalSpent = history.reduce((acc, h) => acc + h.amount, 0);
  const averageSpent = history.length > 0 ? totalSpent / history.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: card.color }}
            >
              {card.brand.slice(0, 2).toUpperCase()}
            </div>
            Histórico - {card.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Total (12 meses)</p>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
              <p className="text-xl font-bold">{formatCurrency(averageSpent)}</p>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Últimos 12 meses</h3>
            
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum histórico disponível
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={`${item.month}-${item.year}`}
                    className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium capitalize">{item.month} {item.year}</p>
                        <p className={cn(
                          "text-xs",
                          item.status === "paid" && "text-success",
                          item.status === "overdue" && "text-destructive",
                          item.status === "pending" && "text-warning"
                        )}>
                          {getStatusText(item.status)}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evolution Chart Placeholder */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">Evolução do Gasto</h3>
            <div className="flex items-end justify-between h-24 gap-1">
              {history.slice(0, 12).reverse().map((item, index) => {
                const maxAmount = Math.max(...history.map(h => h.amount), 1);
                const heightPercent = (item.amount / maxAmount) * 100;
                
                return (
                  <div
                    key={`chart-${item.month}-${item.year}`}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-300"
                      style={{
                        height: `${Math.max(heightPercent, 5)}%`,
                        backgroundColor: item.status === "paid" ? card.color : 
                                         item.status === "overdue" ? "hsl(var(--destructive))" : 
                                         "hsl(var(--warning))",
                        opacity: 0.8,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {item.month.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
