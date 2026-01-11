import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight,
  Trash2,
  Calendar,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Transactions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Period filter state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: transactions, isLoading } = useTransactions();
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

  // Filter transactions by selected month/year
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      const transactionDate = new Date(t.date);
      const matchesPeriod = 
        transactionDate.getMonth() === selectedMonth && 
        transactionDate.getFullYear() === selectedYear;
      const matchesFilter = filter === "all" || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPeriod && matchesFilter && matchesSearch;
    });
  }, [transactions, selectedMonth, selectedYear, filter, searchQuery]);

  // Calculate stats for the filtered period
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [filteredTransactions]);

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

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setIsCalendarOpen(false);
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Método de Pagamento", "Notas"];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category?.name || "Sem categoria",
      t.type === "income" ? "Receita" : "Despesa",
      t.amount.toString().replace(".", ","),
      t.payment_method || "",
      t.notes || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transacoes_${MONTHS[selectedMonth].toLowerCase()}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Transações exportadas com sucesso!");
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (transactions || []).forEach(t => {
      years.add(new Date(t.date).getFullYear());
    });
    years.add(now.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-5 h-5 mr-2" />
            Exportar CSV
          </Button>
          <Button className="btn-gradient" onClick={() => navigate("/add-transaction")}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              {MONTHS[selectedMonth]} {selectedYear}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="center">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Ano</label>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map(year => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Mês</label>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, index) => (
                    <Button
                      key={month}
                      variant={selectedMonth === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedMonth(index);
                        setIsCalendarOpen(false);
                      }}
                    >
                      {month.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button variant="secondary" className="w-full" onClick={goToCurrentMonth}>
                Mês Atual
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-xl font-bold text-success">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Despesas</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(stats.totalExpense)}</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground mb-1">Saldo</p>
          <p className={cn(
            "text-xl font-bold",
            stats.balance >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
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
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm">Não há transações para {MONTHS[selectedMonth]} de {selectedYear}</p>
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