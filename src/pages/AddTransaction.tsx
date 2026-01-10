import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  Repeat
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const categories = {
  income: [
    { id: "salary", label: "Salário", icon: "💰" },
    { id: "freelance", label: "Freelance", icon: "💼" },
    { id: "investment", label: "Investimentos", icon: "📈" },
    { id: "gift", label: "Presente", icon: "🎁" },
    { id: "other", label: "Outros", icon: "📦" },
  ],
  expense: [
    { id: "food", label: "Alimentação", icon: "🍔" },
    { id: "transport", label: "Transporte", icon: "🚗" },
    { id: "housing", label: "Moradia", icon: "🏠" },
    { id: "health", label: "Saúde", icon: "🏥" },
    { id: "entertainment", label: "Lazer", icon: "🎮" },
    { id: "shopping", label: "Compras", icon: "🛍️" },
    { id: "subscription", label: "Assinaturas", icon: "📱" },
    { id: "education", label: "Educação", icon: "📚" },
    { id: "other", label: "Outros", icon: "📦" },
  ],
};

export default function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save transaction
    navigate("/transactions");
  };

  const currentCategories = categories[type];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Nova Transação</h1>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
        <button
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
            type === "expense"
              ? "bg-destructive text-destructive-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingDown className="w-5 h-5" />
          Despesa
        </button>
        <button
          onClick={() => setType("income")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
            type === "income"
              ? "bg-success text-success-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div className="space-y-2">
          <Label>Valor</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">
              R$
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="pl-12 text-2xl font-bold h-14"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Descrição
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Supermercado, Salário..."
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categoria
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {currentCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  category === cat.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full btn-gradient h-12 text-lg">
          Salvar Transação
        </Button>
      </form>
    </AppLayout>
  );
}
