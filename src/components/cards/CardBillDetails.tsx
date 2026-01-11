import { useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CreditCard } from "@/hooks/useCreditCards";

interface BillTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: {
    name: string;
    icon: string;
  } | null;
}

interface CardBillDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CreditCard & { used: number; available: number; currentBill: number };
  transactions: BillTransaction[];
  onMarkAsPaid?: () => void;
  isPending?: boolean;
}

export function CardBillDetails({
  open,
  onOpenChange,
  card,
  transactions,
  onMarkAsPaid,
  isPending = false,
}: CardBillDetailsProps) {
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const now = new Date();
  const closingDate = new Date(now.getFullYear(), now.getMonth(), card.closing_day);
  const dueDate = new Date(now.getFullYear(), now.getMonth(), card.due_day);
  
  // Adjust if closing day has passed
  if (now.getDate() > card.closing_day) {
    closingDate.setMonth(closingDate.getMonth() + 1);
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const usagePercent = card.credit_limit > 0 ? (card.used / card.credit_limit) * 100 : 0;
  const billStatus = daysUntilDue <= 0 ? "overdue" : daysUntilDue <= 5 ? "closing" : "open";

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
            Fatura - {card.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Status Card */}
          <div
            className={cn(
              "rounded-2xl p-6 text-white relative overflow-hidden",
              billStatus === "overdue" && "bg-destructive",
              billStatus === "closing" && "bg-warning",
              billStatus === "open" && "bg-gradient-to-br from-primary to-primary/80"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                {billStatus === "overdue" ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Fatura Vencida</span>
                  </>
                ) : billStatus === "closing" ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Vence em {daysUntilDue} dias</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Fatura Aberta</span>
                  </>
                )}
              </div>

              <p className="text-3xl font-bold mb-1">{formatCurrency(card.used)}</p>
              <p className="text-white/80 text-sm">
                Vencimento: {dueDate.toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uso do limite</span>
              <span className="font-medium">{usagePercent.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  usagePercent >= 80 && "bg-destructive",
                  usagePercent >= 50 && usagePercent < 80 && "bg-warning",
                  usagePercent < 50 && "bg-success"
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Utilizado: {formatCurrency(card.used)}</span>
              <span>Disponível: {formatCurrency(card.available)}</span>
            </div>
          </div>

          {/* Dates Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Fechamento</p>
              <p className="font-semibold">Dia {card.closing_day}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Vencimento</p>
              <p className="font-semibold">Dia {card.due_day}</p>
            </div>
          </div>

          {/* Transactions List */}
          <Collapsible open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span>Transações ({transactions.length})</span>
                </div>
                {isTransactionsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhuma transação neste período
                  </p>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.category?.icon || "💳"}</span>
                        <div>
                          <p className="font-medium text-sm">{t.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-destructive">
                        -{formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Mark as Paid Button */}
          {onMarkAsPaid && card.used > 0 && (
            <Button
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              onClick={onMarkAsPaid}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Marcar como Paga
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
