import { Plus, CreditCard, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreditCardData {
  id: string;
  name: string;
  lastDigits: string;
  brand: "visa" | "mastercard" | "elo" | "amex";
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  color: string;
  currentBill: number;
  billStatus: "open" | "closed" | "paid";
}

const mockCards: CreditCardData[] = [
  {
    id: "1",
    name: "Nubank",
    lastDigits: "4532",
    brand: "mastercard",
    limit: 8000,
    used: 2450,
    closingDay: 15,
    dueDay: 22,
    color: "#8B5CF6",
    currentBill: 2450,
    billStatus: "open",
  },
  {
    id: "2",
    name: "Itaú Platinum",
    lastDigits: "8921",
    brand: "visa",
    limit: 12000,
    used: 4320,
    closingDay: 5,
    dueDay: 12,
    color: "#EC4899",
    currentBill: 3890,
    billStatus: "closed",
  },
  {
    id: "3",
    name: "Inter",
    lastDigits: "7654",
    brand: "mastercard",
    limit: 5000,
    used: 890,
    closingDay: 20,
    dueDay: 27,
    color: "#F59E0B",
    currentBill: 890,
    billStatus: "open",
  },
];

export default function Cards() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case "visa":
        return "VISA";
      case "mastercard":
        return "MC";
      case "elo":
        return "ELO";
      case "amex":
        return "AMEX";
      default:
        return "";
    }
  };

  const totalLimit = mockCards.reduce((acc, card) => acc + card.limit, 0);
  const totalUsed = mockCards.reduce((acc, card) => acc + card.used, 0);
  const totalBill = mockCards.reduce((acc, card) => acc + card.currentBill, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus cartões e faturas
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-5 h-5 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Limite Total</p>
          <p className="text-xl font-bold">{formatCurrency(totalLimit)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Utilizado</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalUsed)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Faturas a Pagar</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totalBill)}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {mockCards.map((card, index) => {
          const usagePercent = (card.used / card.limit) * 100;
          const available = card.limit - card.used;

          return (
            <div
              key={card.id}
              className="animate-slide-up opacity-0"
              style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Card Visual */}
              <div
                className="relative rounded-2xl p-6 text-white mb-4 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <CreditCard className="w-8 h-8" />
                    <span className="text-lg font-bold tracking-wider">
                      {getBrandIcon(card.brand)}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-white/70 text-sm mb-1">Número do cartão</p>
                    <p className="text-xl font-mono tracking-widest">
                      •••• •••• •••• {card.lastDigits}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs">Nome</p>
                      <p className="font-medium">{card.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-xs">Vencimento</p>
                      <p className="font-medium">Dia {card.dueDay}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Fatura Atual</h3>
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      card.billStatus === "open" && "bg-warning/10 text-warning",
                      card.billStatus === "closed" && "bg-destructive/10 text-destructive",
                      card.billStatus === "paid" && "bg-success/10 text-success"
                    )}
                  >
                    {card.billStatus === "open" && <AlertCircle className="w-3 h-3" />}
                    {card.billStatus === "closed" && <Calendar className="w-3 h-3" />}
                    {card.billStatus === "paid" && <CheckCircle2 className="w-3 h-3" />}
                    {card.billStatus === "open" ? "Aberta" : card.billStatus === "closed" ? "Fechada" : "Paga"}
                  </span>
                </div>

                <p className="text-2xl font-bold mb-4">{formatCurrency(card.currentBill)}</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Limite utilizado</span>
                      <span className="font-medium">{usagePercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          usagePercent > 80 ? "bg-destructive" : usagePercent > 50 ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Disponível</p>
                      <p className="font-semibold text-success">{formatCurrency(available)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Limite</p>
                      <p className="font-semibold">{formatCurrency(card.limit)}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Ver Fatura Completa
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
