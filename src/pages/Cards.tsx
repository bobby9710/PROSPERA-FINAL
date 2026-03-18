import { useState, useMemo } from "react";
import { Plus, CreditCard, Trash2, Loader2, Receipt, History, ChevronRight, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCreditCards, useCreditCardStats, useCreateCreditCard, useDeleteCreditCard, CreditCard as CreditCardType, BANK_ICONS } from "@/hooks/useCreditCards";
import { useCardTransactions } from "@/hooks/useTransactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardBillDetails } from "@/components/cards/CardBillDetails";
import { CardBillHistory } from "@/components/cards/CardBillHistory";
import { toast } from "sonner";

const cardColors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#6366F1", "#14B8A6"];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Cards() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showBillHistory, setShowBillHistory] = useState(false);
  const [selectedCard, setSelectedCard] = useState<(CreditCardType & { used: number; available: number; currentBill: number }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [lastDigits, setLastDigits] = useState("");
  const [brand, setBrand] = useState("visa");
  const [creditLimit, setCreditLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [color, setColor] = useState(cardColors[0]);

  const { data: cards, isLoading } = useCreditCardStats();
  const createCard = useCreateCreditCard();
  const deleteCard = useDeleteCreditCard();

  // Fetch transactions for selected card
  const { data: cardTransactions = [] } = useCardTransactions(selectedCard?.id || null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBrandIcon = (card: CreditCardType) => {
    const iconFile = BANK_ICONS[card.brand.toLowerCase()];
    if (iconFile) {
      return (
        <img 
          src={`/icons/bancos/${iconFile}`} 
          alt={card.brand} 
          className="h-8 object-contain brightness-0 invert" 
        />
      );
    }
    return <span className="text-lg font-bold tracking-wider">{card.brand.toUpperCase()}</span>;
  };

  // Generate mock history for demonstration
  const generateHistory = (card: CreditCardType & { used: number }) => {
    const history = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      history.push({
        month: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        amount: i === 0 ? card.used : Math.random() * Number(card.credit_limit) * 0.6,
        status: i === 0 ? "pending" as const : "paid" as const,
      });
    }
    return history;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastDigits || !creditLimit || !closingDay || !dueDay) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (lastDigits.length !== 4) {
      toast.error("Os últimos 4 dígitos devem ter exatamente 4 números");
      return;
    }

    try {
      await createCard.mutateAsync({
        name,
        last_digits: lastDigits,
        brand,
        credit_limit: parseFloat(creditLimit),
        closing_day: parseInt(closingDay),
        due_day: parseInt(dueDay),
        color,
      });
      toast.success("Cartão criado com sucesso!");
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar cartão");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCard.mutateAsync(deleteId);
      toast.success("Cartão excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir cartão");
    }
    setDeleteId(null);
  };

  const resetForm = () => {
    setName("");
    setLastDigits("");
    setBrand("visa");
    setCreditLimit("");
    setClosingDay("");
    setDueDay("");
    setColor(cardColors[0]);
  };

  const openBillDetails = (card: CreditCardType & { used: number; available: number; currentBill: number }) => {
    setSelectedCard(card);
    setShowBillDetails(true);
  };

  const openBillHistory = (card: CreditCardType & { used: number; available: number; currentBill: number }) => {
    setSelectedCard(card);
    setShowBillHistory(true);
  };

  // Summary calculations
  const totalLimit = useMemo(() => 
    (cards || []).reduce((acc, c) => acc + Number(c.credit_limit), 0), 
    [cards]
  );
  const totalUsed = useMemo(() => 
    (cards || []).reduce((acc, c) => acc + c.used, 0), 
    [cards]
  );
  const totalAvailable = useMemo(() => 
    (cards || []).reduce((acc, c) => acc + c.available, 0), 
    [cards]
  );

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
        <Button className="btn-gradient" onClick={() => setShowCreateDialog(true)}>
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
          {totalLimit > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {((totalUsed / totalLimit) * 100).toFixed(0)}% do limite
            </p>
          )}
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Disponível</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalAvailable)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (cards || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
          <CreditCard className="w-12 h-12 mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium">Nenhum cartão cadastrado</p>
          <p className="text-sm">Adicione seu primeiro cartão clicando no botão acima</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(cards || []).map((card, index) => {
            const usagePercent = card.credit_limit > 0 ? (card.used / Number(card.credit_limit)) * 100 : 0;

            return (
              <div
                key={card.id}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Card Visual */}
                <div
                  className="relative rounded-2xl p-6 text-white mb-4 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                  }}
                  onClick={() => openBillDetails(card)}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      {getBrandIcon(card)}
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-white/70 text-sm mb-1">Número do cartão</p>
                      <p className="text-xl font-mono tracking-widest">
                        •••• •••• •••• {card.last_digits}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs">Nome</p>
                        <p className="font-medium">{card.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">Vencimento</p>
                        <p className="font-medium">Dia {card.due_day}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Fatura Atual</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openBillDetails(card)}
                        title="Ver detalhes da fatura"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openBillHistory(card)}
                        title="Ver histórico"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Uso do limite</span>
                      <span className="font-semibold">{usagePercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
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
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Fatura</p>
                      <p className="font-semibold text-primary">{formatCurrency(card.used)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Disponível</p>
                      <p className="font-semibold text-success">{formatCurrency(card.available)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Limite</p>
                      <p className="font-semibold">{formatCurrency(Number(card.credit_limit))}</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => openBillDetails(card)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Ver Fatura Completa
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Card Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cartão</DialogTitle>
            <DialogDescription>
              Adicione um novo cartão de crédito.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do cartão *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Itaú..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Últimos 4 dígitos *</Label>
                <Input
                  value={lastDigits}
                  onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bandeira</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {Object.keys(BANK_ICONS).sort().map((b) => (
                        <SelectItem key={b} value={b} className="capitalize">
                          {b}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Limite de crédito *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dia de fechamento *</Label>
                <Input
                  type="number"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  placeholder="15"
                  min="1"
                  max="31"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Dia de vencimento *</Label>
                <Input
                  type="number"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="22"
                  min="1"
                  max="31"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {cardColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all",
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={createCard.isPending}>
              {createCard.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Cartão"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bill Details Modal */}
      {selectedCard && (
        <CardBillDetails
          open={showBillDetails}
          onOpenChange={setShowBillDetails}
          card={selectedCard}
          transactions={cardTransactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            date: t.date,
            category: t.category,
          }))}
        />
      )}

      {/* Bill History Modal */}
      {selectedCard && (
        <CardBillHistory
          open={showBillHistory}
          onOpenChange={setShowBillHistory}
          card={selectedCard}
          history={generateHistory(selectedCard)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cartão será permanentemente excluído.
              As transações vinculadas a este cartão não serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
