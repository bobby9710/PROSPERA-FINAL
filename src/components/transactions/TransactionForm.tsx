import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useCreditCards } from "@/hooks/useCreditCards";
import { Transaction, CreateTransactionData } from "@/hooks/useTransactions";
import { toast } from "sonner";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTransactionData) => Promise<void>;
  initialData?: Transaction | null;
  isPending?: boolean;
  mode?: "create" | "edit" | "duplicate";
}

const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "cash", label: "Dinheiro" },
  { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" },
  { value: "transfer", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending = false,
  mode = "create",
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [creditCardId, setCreditCardId] = useState("");
  const [installments, setInstallments] = useState("1");

  const { data: categories, isLoading: categoriesLoading } = useCategories(type);
  const { data: creditCards } = useCreditCards();

  useEffect(() => {
    if (initialData && open) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setDescription(mode === "duplicate" ? `${initialData.description} (cópia)` : initialData.description);
      setCategoryId(initialData.category_id || "");
      setDate(mode === "duplicate" ? new Date().toISOString().split("T")[0] : initialData.date);
      setPaymentMethod(initialData.payment_method || "");
      setNotes(initialData.notes || "");
      setIsRecurring(initialData.is_recurring);
      setCreditCardId(initialData.credit_card_id || "");
    } else if (!initialData && open) {
      resetForm();
    }
  }, [initialData, open, mode]);

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setDescription("");
    setCategoryId("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("");
    setNotes("");
    setIsRecurring(false);
    setCreditCardId("");
    setInstallments("1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("O valor deve ser maior que zero");
      return;
    }

    if (!description.trim()) {
      toast.error("A descrição é obrigatória");
      return;
    }

    const data: CreateTransactionData = {
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category_id: categoryId || undefined,
      date,
      payment_method: paymentMethod || undefined,
      notes: notes.trim() || undefined,
      is_recurring: isRecurring,
      credit_card_id: paymentMethod === "credit" && creditCardId ? creditCardId : undefined,
    };

    try {
      // If installments > 1, create multiple transactions
      const numInstallments = parseInt(installments) || 1;
      if (paymentMethod === "credit" && numInstallments > 1) {
        const installmentAmount = parseFloat(amount) / numInstallments;
        for (let i = 0; i < numInstallments; i++) {
          const installmentDate = new Date(date);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          await onSubmit({
            ...data,
            amount: installmentAmount,
            description: `${description.trim()} (${i + 1}/${numInstallments})`,
            date: installmentDate.toISOString().split("T")[0],
          });
        }
      } else {
        await onSubmit(data);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error handled in parent
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "edit":
        return "Editar Transação";
      case "duplicate":
        return "Duplicar Transação";
      default:
        return "Nova Transação";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Atualize os dados da transação." : "Preencha os dados da transação."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategoryId("");
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-medium transition-all text-sm",
                type === "expense"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategoryId("");
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-medium transition-all text-sm",
                type === "income"
                  ? "bg-success text-success-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Receita
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Valor *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="pl-10 text-lg font-semibold"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Salário..."
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center",
                      categoryId === cat.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium truncate w-full">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Credit Card Selection */}
          {paymentMethod === "credit" && type === "expense" && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Cartão de Crédito
                </Label>
                <Select value={creditCardId} onValueChange={setCreditCardId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cartão..." />
                  </SelectTrigger>
                  <SelectContent>
                    {creditCards?.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} •••• {card.last_digits}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x {n > 1 ? `de R$ ${(parseFloat(amount || "0") / n).toFixed(2)}` : "à vista"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações adicionais..."
              rows={2}
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-base">Transação Recorrente</Label>
              <p className="text-sm text-muted-foreground">Esta transação se repete mensalmente</p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full btn-gradient" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "edit" ? (
              "Salvar Alterações"
            ) : (
              "Criar Transação"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
