import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight,
  Trash2,
  Calendar,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction, useTransactionStats } from "@/hooks/useTransactions";
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
import { toast } from "sonner";

export default function Transactions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: transactions, isLoading } = useTransactions();
  const { data: stats } = useTransactionStats();
  const deleteTransaction = useDeleteTransaction();

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

  const filteredTransactions = (transactions || []).filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction.mutateAsync(deleteId);
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir transação");
    }
    setDeleteId(null);
  };

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
        <Button className="btn-gradient" onClick={() => navigate("/add-transaction")}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
          <p className="text-xl font-bold text-success">{formatCurrency(stats?.totalIncome || 0)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(stats?.totalExpense || 0)}</p>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm">Adicione sua primeira transação clicando no botão acima</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredTransactions.map((transaction) => (
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
                    <span className="text-sm text-muted-foreground">
                      {transaction.category?.name || "Sem categoria"}
                    </span>
                    {transaction.payment_method && (
                      <>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="text-sm text-muted-foreground">{transaction.payment_method}</span>
                      </>
                    )}
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
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(transaction.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será permanentemente excluída.
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
