import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  method: string;
}

const mockTransactions: Transaction[] = [
  { id: "1", description: "Salário", category: "Renda", amount: 8500, type: "income", date: "2024-01-05", method: "Transferência" },
  { id: "2", description: "Supermercado Extra", category: "Alimentação", amount: 342.5, type: "expense", date: "2024-01-04", method: "Cartão Crédito" },
  { id: "3", description: "Netflix", category: "Assinaturas", amount: 55.9, type: "expense", date: "2024-01-03", method: "Cartão Crédito" },
  { id: "4", description: "Uber", category: "Transporte", amount: 28.5, type: "expense", date: "2024-01-03", method: "Débito" },
  { id: "5", description: "Freelance Design", category: "Renda Extra", amount: 1200, type: "income", date: "2024-01-02", method: "PIX" },
  { id: "6", description: "Farmácia", category: "Saúde", amount: 89.9, type: "expense", date: "2024-01-02", method: "PIX" },
  { id: "7", description: "Academia", category: "Saúde", amount: 120, type: "expense", date: "2024-01-01", method: "Débito Automático" },
  { id: "8", description: "Restaurante", category: "Alimentação", amount: 156.8, type: "expense", date: "2024-01-01", method: "Cartão Crédito" },
];

export default function Transactions() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      year: "numeric",
    });
  };

  const filteredTransactions = mockTransactions.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalIncome = mockTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = mockTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-5 h-5 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  filter === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "Todas" : type === "income" ? "Receitas" : "Despesas"}
              </button>
            ))}
          </div>
          
          <Button variant="outline" size="icon">
            <Calendar className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '250ms' }}>
        <div className="divide-y divide-border/50">
          {filteredTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  transaction.type === "income"
                    ? "bg-success/10"
                    : "bg-destructive/10"
                )}
              >
                {transaction.type === "income" ? (
                  <ArrowDownLeft className="w-6 h-6 text-success" />
                ) : (
                  <ArrowUpRight className="w-6 h-6 text-destructive" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-muted-foreground">{transaction.category}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-sm text-muted-foreground">{transaction.method}</span>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    transaction.type === "income"
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </p>
              </div>

              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
